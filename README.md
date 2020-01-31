# rollup-plugin-css-asset

Bundle CSS as a [Rollup](https://rollupjs.org/) asset.

## Install

```sh
npm i --save-dev rollup-plugin-css-asset # or yarn add -D rollup-plugin-css-asset
```

## Usage

```js
// rollup.config.js
import css from 'rollup-plugin-css-asset';

export default {
  output: {
    // Plugin respects Rollup sourcemap options.
    sourcemap: true,
    sourcemapExcludeSources: false,
    // Bundled CSS will observe configured name pattern for emitted assets.
    assetFileNames: 'assets/[name]-[hash][extname]',
  },
  plugins: [
    css({
      // Rollup `[name]` file name placeholder; matches that of entry file by default.
      name: 'bundle',
    }),
  ],
};
```

## License

[MIT](https://github.com/alexdilley/rollup-plugin-css-asset/blob/master/LICENSE)
