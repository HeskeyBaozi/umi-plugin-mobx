import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy-assets';

export default {
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
  external: ['path', 'fs','globby','pluralize']
}
