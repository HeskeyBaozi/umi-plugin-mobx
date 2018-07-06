# umi-plugin-mobx

😍 优雅地使用`mobx-state-tree`响应式数据流生态来整合`umi`。

## Features

- 使用状态树节点自动包裹路由组件（通过高阶组件形式），提供页面纬度的数据状态流。
- 通过封装`umi/dynamic`动态加载状态树节点。
- Redux是不是写的很烦？快来试试Mobx和其最佳实践`mobx-state-tree`，开箱即用。

## Install

```bash
yarn add umi-plugin-mobx
```

## Usage

### Add plugin

在`.umirc.js`文件中添加该插件，注意`umi`会自动读取`stores`文件夹作为路由（`stores`文件夹名字可自定义），为了跳过它，使用`umi-plugin-routes`来进行相应配置。

```js
// .umirc.js

export default {
  plugins: [
    ['umi-plugin-mobx', {
      modelName: 'store', // 或者写复数形式皆可 "stores", 默认值为 "store", 你也可以像使用dva一样命名为 "model"。
      exclude: [/^\$/, (filename) => filename.includes('__')]
    }],
    ['umi-plugin-routes', {
      exclude: [/stores/] // 忽略目录 **/stores/**/*.*, 你也可以像使用dva一样设置为 /models/ 。
    }]
  ]
}
```

```bash
yarn add umi-plugin-routes
```

**[不建议]** 你也通过目录下的 `page.jsx` 或 `page.tsx` 文件来跳过 `umijs` 的目录解析。

- 插件配置选项
```ts
interface PluginOptions {
  modelName?: string;
  exclude?: Excludes;
}

type Excludes = (RegExp | TestFn)[];
type TestFn = (filename: string) => boolean;
```

### Config mobx

Mobx [config documents](https://github.com/mobxjs/mobx/blob/gh-pages/docs/refguide/api.md#configure)
```js
// src/mobx.ts
// 或者 src/mobx.js
export function config() {
  return {
    enforceActions: true // 或者设置为 'strict' 来启用严格模式
  };
}
```

## Example:simple

创建一个状态树节点
```ts
// src/stores/user.ts

import { types, flow } from 'mobx-state-tree';

export const Item = types
  .model('item', {
    key: types.string,
    content: types.string
  });

type ItemSnapshotType = typeof Item.SnapshotType;

const User = types
  .model({
    firstName: types.string,
    lastName: types.string,
    age: types.number,
    list: types.array(Item)
  })
  .views((self) => ({
    get name() {
      return self.firstName + ' ' + self.lastName;
    }
  }))
  .volatile((self) => ({
    uid: 0
  }))
  .actions((self) => ({
    changeFirstName(str: string) {
      self.firstName = str;
    },
    addListItemAsync: flow(function* addListItemAsync() {
      const currentUid = self.uid++;
      const item: ItemSnapshotType = yield new Promise<ItemSnapshotType>((resolve) => setTimeout(() => {
        resolve({
          key: 'item-' + currentUid,
          content: 'this is content...'
        });
      }, 1000));
      self.list.push(Item.create(item));
    })
  }))


export type UserType = typeof User.Type;

export default User.create({
  firstName: 'Heskey',
  lastName: 'Baozi',
  age: 20,
  list: []
});

```


创建一个观察者，并且注入状态树节点
```tsx
// src/pages/about.tsx

import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { UserType } from '../stores/user';
import { observable, action, computed } from 'mobx';

interface AboutProps {
  user?: UserType;
}

@inject('user')
@observer
export default class About extends React.Component<AboutProps> {

  @observable
  count = 15;

  @action
  handleChangeInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.props.user!.changeFirstName(e.currentTarget.value)
  }

  @action
  up = () => {
    console.log('click to ', this.count);
    this.count++;
  }

  handleClickAddItem: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const { user } = this.props;
    await user!.addListItemAsync();
    console.log('add, uid = ', user!.uid);
  }

  @computed
  get List() {
    const { user } = this.props;
    return user!.list.map((item) => (
      <li key={ item.key }>
        [{ item.key }]: { item.content }
      </li>
    ));
  }


  render() {
    return (
      <div>
        <h1>About</h1>
        <p>Name: { this.props.user!.name }</p>
        <input type="text" value={ this.props.user!.firstName } onChange={ this.handleChangeInput } />
        <p>count: { this.count }</p>
        <button onClick={ this.up }>count++</button>
        <p>List: <button onClick={ this.handleClickAddItem }>Add Item</button></p>
        <ul>
          { this.List }
        </ul>
      </div>
    );
  }
}
```
