var $ = window.$ = window.jQuery = require('jquery'); // Set window.jQuery - needed for Materialize
var Materialize = require('materialize-css/dist/js/materialize.js');

require('../css/index.scss');
require.context('../images', true, /.*\.(ico|gif|png|jpe?g|svg)$/i);

console.log("HELLO!")
