var $ = window.$ = window.jQuery = require('jquery'); // Set window.jQuery - needed for Materialize
var Materialize = require('materialize-css/dist/js/materialize.js');
var Initializer = require('./application/initializer.jsx')

require('../css/index.scss');
require.context('../images', true, /.*\.(ico|gif|png|jpe?g|svg)$/i);

var urlParts = window.location.href.toString().split(window.location.host);
var pathParts = urlParts[1].toLowerCase().trim().replace(/^[\s\uFEFF\xA0\/]+|[\s\uFEFF\xA0\/]+$/g, '').split('/');

var viewFn = pathParts.reduce((acc, part) => {
  return acc[part] || {};
}, Initializer);

if (viewFn.call) {
  viewFn.call();
}
