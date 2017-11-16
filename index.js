/* eslint-disable */
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/cjs/redux-promise-middleware.production.min.js');
} else {
  module.exports = require('./dist/cjs/redux-promise-middleware.development.js');
}
