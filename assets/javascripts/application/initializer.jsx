var React = require('react');
var ReactDOM = require('react-dom');

var Clock = require('./components/clock')
var Kmeans = require('./components/kmeans')
var Swarm = require('./components/swarm')
var Orbit = require('./components/orbit')

var node = document.getElementById('application');

var Initializer = {
  projects: {
    kmeans: function() {
      console.log('Initializing kmeans');
      ReactDOM.render(<Kmeans />, node);
    },
    orbit: function() {
      console.log('Initializing orbit');
      ReactDOM.render(<Orbit />, node);
    },
    swarm: function() {
      console.log('Initializing swarm.');
      ReactDOM.render(<Swarm />, node);
    },
    clock: function() {
      console.log('Initializing clock');
      ReactDOM.render(<Clock />, node);
    },
  }
};

module.exports = Initializer;
