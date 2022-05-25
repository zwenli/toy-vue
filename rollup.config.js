export default {
  input: './src/index.js',
  output: [
    {
      file: 'dist/toy-vue.esm.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/toy-vue.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
  ],
}
