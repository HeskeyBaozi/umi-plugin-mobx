import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/index.ts',
  output: {
    file: './lib/index.esm.js',
    format: 'es'
  },
  plugins: [
    typescript(/*{ plugin options }*/)
  ],
  external: ['path']
}
