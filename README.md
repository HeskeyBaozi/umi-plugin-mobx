# umi-plugin-mobx

😍 use `mobx-state-tree` with umi gracefully.

[中文文档 Docs Chinese version](./README_CN.md)

## Features

- Automatically wrap route components with state tree nodes.
- Support dynamic import state tree nodes by using `umi/dynamic`.
- Use Mobx ecosystem rather than Redux.
- Resolve rules are same with `umi-plugin-dva`, so you just export a state tree node by default.

## Install

```bash
yarn add umi-plugin-mobx
```

## Usage

### Add plugin

Add plugin to `.umirc.js` file, to ignore the model folders which are named `stores` or other custom name, you need to install `umi-plugin-routes` to tell `umi` to ignore them.

```js
// .umirc.js

export default {
  plugins: [
    ['umi-plugin-mobx', {
      modelName: 'store', // or "stores", defaults to "store", you can set "model" like dva.
      exclude: [/^\$/, (filename) => filename.includes('__')]
    }],
    ['umi-plugin-routes', {
      exclude: [/stores/] // ignore **/stores/**/*.*, you can set /models/ like dva.
    }]
  ]
}
```

```bash
yarn add umi-plugin-routes
```

**[Deprecated]** You can also just use `page.jsx` or `page.tsx` to skip `umijs` dirctory resolving.

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
    enforceActions: true // or 'strict' for strict-mode
  };
}
```

## [Example:user-dashboard](./examples/user-dashboard)
## [Example:simple](./examples/simple)

### How to run examples?

If you want to run user-dashboard...
```bash
git clone https://github.com/HeskeyBaozi/umi-plugin-mobx
cd umi-plugin-mobx
yarn install
yarn link
cd examples/user-dashboard
yarn install
yarn link umi-plugin-mobx
yarn start
```

MST Node Example:
```ts
// examples/user-dashboard/src/pages/users/stores/users.ts
// mobx-state-tree version like dva's model.
// dva version: https://github.com/umijs/umi-dva-user-dashboard/blob/master/src/pages/users/models/users.js

import { AxiosResponse } from 'axios';
import { applyAction, flow, types } from 'mobx-state-tree';
import { Loading } from '../../../stores/$loading';
import { $ } from '../../../utils';
import { User } from './$user';

const Users = types
  .compose(Loading, types.model({
    list: types.array(User),
    total: types.maybe(types.number),
    page: types.maybe(types.number)
  }))
  .named('users')
  .volatile((self) => {
    return {
      PAGE_SIZE: 5
    };
  })
  .actions((self) => {
    return {
      fetchAsync: flow(function* fetchAsync({ page }: { page: number }) {
        const { data, headers }: AxiosResponse<any[]> = yield $.get(`/users?_page=${page}&_limit=${self.PAGE_SIZE}`);
        self.list.clear();
        self.list.push(...data);
        self.total = Number.parseInt(headers['x-total-count']);
        self.page = page;
      }),
      removeAsync: flow(function* removeAsync({ id }: { id: number }) {
        yield $.delete(`/users/${id}`);
      }),
      updateAsync: flow(function* updateAsync({ id, values }: { id: number, values: object }) {
        yield $.patch(`/users/${id}`, JSON.stringify(values));
      }),
      createAsync: flow(function* createAsync({ values }: { values: object }) {
        yield $.post(`/users`, JSON.stringify(values));
      })
    };
  });

export type UsersType = typeof Users.Type;
export default Users.create({
  list: [],
  total: null
});
```
