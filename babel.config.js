// @flow

/* ::

type ApiType = {|
  +cache: {|
    forever: () => void
  |},
  +assertVersion: number => void,
|}

*/

module.exports = function (api /* : ApiType */) {
  api.assertVersion(7);
  api.cache.forever();

  return {
    presets: ['@babel/preset-env'],
    plugins: [
      '@babel/plugin-transform-flow-strip-types',
      '@babel/plugin-proposal-class-properties'
      ]
  };
};
