const path = require('path');
const CleanCSS = require('clean-css');
const Concat = require('concat-with-sourcemaps');
const convert = require('convert-source-map');
const { createFilter } = require('rollup-pluginutils');

module.exports = function css(options = {}) {
  const filter = createFilter(options.include || '**/*.css', options.exclude);
  const extracted = new Map();

  return {
    name: 'css',

    transform(code, id) {
      if (!filter(id)) return;

      // Extract source map if supplied inline (e.g. by css-in-js transpilation).
      const { sourcemap: map } = convert.fromSource(code) || {};

      extracted.set(id, { id, code: convert.removeComments(code), map });

      return '';
    },

    generateBundle(opts, bundle) {
      if (!extracted.size) return;

      const entry = Object.values(bundle).find(info => info.isEntry);
      const styles = [...extracted.values()];

      // Order extracted styles to maintain correct cascading of CSS rules.
      if (entry.modules) {
        const ids = Object.keys(entry.modules);

        styles.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      }

      const file = opts.file || path.join(opts.dir, entry.fileName);
      const name = options.name || path.basename(file, path.extname(file));
      const referenceId = this.emitFile({
        type: 'asset',
        // Basis for calculating hash.
        source: styles.reduce((acc, { code }) => acc + code, ''),
        name: `${name}.css`,
      });
      const fileName = this.getFileName(referenceId);
      const mapFileName = `${fileName}.map`;

      // Concatenate.
      const concat = new Concat(true, fileName, '\n');
      styles.forEach(({ id, code, map }) => concat.add(id, code, map));

      // Minify.
      const output = new CleanCSS({
        sourceMap: true,
        sourceMapInlineSources: !opts.sourcemapExcludeSources,
      }).minify(concat.content, concat.sourceMap);

      // Bundle.
      bundle[fileName].source = output.styles;
      if (opts.sourcemap) {
        const sourceMapComment = convert.generateMapFileComment(
          path.basename(mapFileName),
          {
            multiline: true,
          }
        );

        bundle[fileName].source += sourceMapComment;
        this.emitFile({
          type: 'asset',
          source: output.sourceMap.toString(),
          fileName: mapFileName,
        });
      }
    },
  };
};
