// inspired by:
// - https://github.com/rollup/rollup-starter-lib/blob/master/rollup.config.js
// - https://github.com/facebook/react/blob/master/scripts/rollup/build.js

import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

const getPath = (format, env) => {
  const path = `dist/${format}/${pkg.name}.${env}`;
  if (env === 'production') return `${path}.min.js`;
  return `${path}.js`
};

const createConfig = env => ({
  input: 'src/index.js',
  output: [
    { file: getPath('cjs', env), format: 'cjs' },
    { file: getPath('umd', env), format: 'umd', name: 'reduxPromiseMiddleware' },
  ],
  plugins: [
    babel({
      externalHelpers: false,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    env === 'production' && minify(),
  ].filter(Boolean),
});


export default [
  createConfig('production'),
  createConfig('development'),
];
