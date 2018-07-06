export default {
  plugins: [
    ['umi-plugin-mobx', {
      modelName: 'store',
      exclude: [/^\$/, (filename) => filename.includes('__')]
    }]
  ]
}
