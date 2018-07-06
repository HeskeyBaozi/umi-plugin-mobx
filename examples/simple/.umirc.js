export default {
  plugins: [
    ['umi-plugin-mobx', {
      modelName: 'store', // or "stores"
      exclude: [/^\$/, (filename) => filename.includes('__')]
    }],
    ['umi-plugin-routes', {
      exclude: [/stores/] // ignore **/stores/**/*.*
    }]
  ]
}
