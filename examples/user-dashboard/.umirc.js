export default {
  plugins: [
    ['umi-plugin-mobx', { exclude: [(name) => name.startsWith('$')] }],
    ['umi-plugin-routes', {
      exclude: [/stores/]
    }]
  ]
}
