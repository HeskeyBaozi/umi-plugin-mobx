# umi-plugin-mobx

😍 use `mobx-state-tree` with umi gracefully.

## Features

- Automatically wrap route components with state tree nodes.
- Support dynamic import state tree nodes by using `umi/dynamic`.
- Use Mobx ecosystem rather than Redux.

## Install

```bash
yarn add umi-plugin-mobx
```

## Usage

### Add plugin
```js
// .umirc.js
export default {
  plugins: [
    ['umi-plugin-mobx', {
      modelName: 'store',
      exclude: [/^\$/, (filename) => filename.includes('__')]
    }]
  ]
}
```

- options
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
// or src/mobx.js
export function config() {
  return {
    enforceActions: 'strict' // use strict-mode
  };
}
```

## Example:simple

Create a state-tree node.
```ts
// src/stores/user.ts
import { types } from 'mobx-state-tree';

export const Item = types
  .model('item', {
    key: types.string,
    content: types.string
  });

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
  .actions((self) => ({
    changeFirstName(str: string) {
      self.firstName = str;
    }
  }));

export type UserType = typeof User.Type;

export default User.create({
  firstName: 'Heskey',
  lastName: 'Baozi',
  age: 20,
  list: []
});
```


Create an observer and inject the state-tree node.
```tsx
// src/pages/about.tsx
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { UserType } from '../stores/user';
import { observable, action } from 'mobx';

interface AboutProps {
  user?: UserType;
}

@inject('user')
@observer
export default class About extends React.Component<AboutProps> {

  @observable
  count = 0;

  @action
  handleChangeInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.props.user!.changeFirstName(e.currentTarget.value)
  }

  @action
  up = () => {
    console.log('click to ', this.count);
    this.count++;
  }


  render() {
    return (
      <div>
        <h1>About</h1>
        <p>Name: {this.props.user!.name}</p>
        <input type="text" value={this.props.user!.firstName} onChange={this.handleChangeInput} />
        <p>count: {this.count}</p>
        <button onClick={this.up}>count++</button>
      </div>
    );
  }
}
```
