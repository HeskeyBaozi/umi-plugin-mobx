import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy-assets';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default [
  {
    input: './src/index.ts',
    output: {
      file: './lib/index.js',
      format: 'cjs'
    },
    plugins: [
      typescript(),
      copy({
        assets: ['./src/template']
      })
    ],
    external: ['path', 'fs', 'globby', 'pluralize']
  },
  {
    input: './src/withProvider.ts',
    output: {
      file: './lib/withProvider.js',
      format: 'es'
    },
    plugins: [
      typescript(),
      copy({
        assets: ['./src/template']
      })
    ],
    external: ['path', 'fs', 'globby', 'pluralize', 'react', 'react-dom', 'mobx', 'mobx-react', 'mobx-state-tree']
  }
]
