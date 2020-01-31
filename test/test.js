const { rollup } = require('rollup');
const { join } = require('path');
const test = require('tape');
const plugin = require('..');

const inputOptions = { input: join(__dirname, 'fixtures/main.js') };
const outputOptions = {
  file: 'bundle.js',
  assetFileNames: 'assets/[name]-[hash][extname]', // the default
};

test('default', async t => {
  t.plan(4);

  const bundle = await rollup({ ...inputOptions, plugins: [plugin()] });
  const { output } = await bundle.generate(outputOptions);
  const [, css] = output;

  t.is(css.type, 'asset', 'is an asset');
  t.match(
    css.fileName,
    /^assets\/bundle-\w{8}\.css$/,
    'has same name as entry'
  );
  t.equal(css.source, 'body{margin:0}', 'has minified content');
  t.doesNotMatch(
    css.source,
    /sourceMappingURL/,
    'does not point to a source map'
  );
});

test('name', async t => {
  t.plan(1);

  const bundle = await rollup({
    ...inputOptions,
    plugins: [plugin({ name: 'bundle' })],
  });
  const { output } = await bundle.generate({
    ...outputOptions,
    assetFileNames: '[name][extname]',
  });
  const [, css] = output;

  t.equals(css.fileName, 'bundle.css');
});

test('sourcemap', async t => {
  t.plan(2);

  const bundle = await rollup({ ...inputOptions, plugins: [plugin()] });
  const { output } = await bundle.generate({
    ...outputOptions,
    sourcemap: true,
  });
  const [, , map] = output;

  t.isNot(map, null, 'is emitted');
  t.match(map.source, /sourcesContent/, 'inlines source');
});

test('sourcemapExcludeSources', async t => {
  t.plan(1);

  const bundle = await rollup({ ...inputOptions, plugins: [plugin()] });
  const { output } = await bundle.generate({
    ...outputOptions,
    sourcemap: true,
    sourcemapExcludeSources: true,
  });
  const [, , map] = output;

  t.doesNotMatch(map.source, /sourcesContent/, 'is respected');
});
