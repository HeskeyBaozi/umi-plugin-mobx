# umi-plugin-mobx

use `mobx-state-tree` with umi gracefully.

## Features

- Automatically wrap route components with state tree nodes.
- Support dynamic import state tree nodes by using `umi/dynamic`.
- Use `Mobx` ecosystem rather than `Redux`.

## Install

```bash
yarn add umi-plugin-mobx
```

## Usage

### add plugin
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

### config mobx

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
