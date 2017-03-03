var React = require('react');
var $ = require('jquery');
var Drawing = require('../drawing')

class Kmeans extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      observations: [],
      clusters: [],
      mapping: [],
      running: false,
      convergence: null
    };
  }

  generateRandomObservations(count) {
    var observations = []
    for (var i = 0; i < count; i++) {
      observations.push({
        x: Math.round(Math.random() * this.refs.canvas.width),
        y: Math.round(Math.random() * this.refs.canvas.height)
      });
    }
    this.setState({ observations: observations, mapping: [] });
  }

  generateRandomClusters(count) {
    var clusters = [], hue, offset;
    var hues = [0, 60, 120, 180, 240, 300, 30, 90, 150, 210, 270, 330, 15, 45, 75, 105, 135, 165, 195, 225];
    for (var i = 0; i < count; i++) {
      hue = hues[i];
      clusters.push({
        x: Math.round(Math.random() * this.refs.canvas.width),
        y: Math.round(Math.random() * this.refs.canvas.height),
        index: i,
        hue: hue
      });
    }
    this.setState({ clusters: clusters, mapping: [] });
  }

  handleObservationCountChange() {
    var count = $(this.refs['observation-count']).val();
    this.generateRandomObservations(count);
  }

  handleClusterCountChange() {
    var count = $(this.refs['cluster-count']).val();
    this.generateRandomClusters(count);
  }

  handleStart() {
    this.iterate();
    this.setState({ running: true });
    this.interval = setInterval(() => {
      this.iterate();
    }, 2000);
  }

  handleStop() {
    console.log("STOP!");
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    this.setState({ running: false });
  }

  handleReset() {
    this.handleObservationCountChange();
    this.handleClusterCountChange();
    this.setState({ convergence: null });
  }

  iterate() {
    var mapping = [], reverseMapping = {}, clusters = this.state.clusters;
    var distanceBetween = function(a, b) {
      return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    };

    this.state.observations.forEach((observation, index) => {
      var distanceSortedClusters = clusters.sort((c1, c2) => {
        var d1 = distanceBetween(c1, observation);
        var d2 = distanceBetween(c2, observation);
        if (d1 < d2) { return -1; }
        else if (d1 > d2) { return 1; }
        else { return 0; }
      });
      var closestCluster = distanceSortedClusters[0];
      mapping[index] = closestCluster;
      reverseMapping[closestCluster.index] = reverseMapping[closestCluster.index] || [];
      reverseMapping[closestCluster.index].push(observation);
    });
    this.setState({ mapping: mapping, convergence: this.state.convergence || -1 });

    this.timeout = setTimeout(() => {
      var centroid, observations, distanceTraveled = 0;
      var newClusters = clusters.map((cluster, index) => {
        observations = reverseMapping[index] || [];
        centroid = observations.reduce((acc, observation) => {
          return {
            x: acc.x + observation.x / (1.0 * observations.length),
            y: acc.y + observation.y / (1.0 * observations.length)
          }
        }, { x: 0.0, y: 0.0 });
        distanceTraveled += distanceBetween(cluster, centroid);
        return Object.assign({}, cluster, centroid);
      });

      var running = true, convergence = distanceTraveled/(1.0 * clusters.length);
      if (convergence <= 1) {
        running = false;
        clearInterval(this.interval);
      }
      this.setState({clusters: newClusters, running: running, convergence: convergence});
    }, 1000);
  }

  getSubtext() {
    if (this.state.convergence === null) {
      return null;
    } else if (this.state.convergence < 0) {
      return 'Calculating Convergence...';
    } else if (this.state.convergence <= 1) {
      return 'Converged!';
    } else {
      return 'Convergence: ' + Math.round(this.state.convergence);
    }
  }

  componentDidMount() {
    this.handleReset();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentDidUpdate(prevProps, prevState) {
    var canvas = this.refs.canvas;
    var ctx = canvas.getContext('2d');
    Drawing.clear(ctx);

    this.state.observations.forEach((observation, index) => {
      var color = '#000';
      if (this.state.mapping[index]) {
        color = 'hsl(' + this.state.mapping[index].hue + ', 100%, 40%)';
      }
      Drawing.disc(ctx, {
        fill: { style: color },
        center: observation,
        nRadius: 0.5
      })
    });

    this.state.clusters.forEach((cluster) => {
      Drawing.disc(ctx, {
        fill: {
          style: 'hsl(' + cluster.hue + ', 100%, 40%)'
        },
        center: {x: cluster.x, y: cluster.y},
        nRadius: 1
      })
    });
  }

  render() {
    return (
      <div className='row kmeans'>
        <canvas className='col s8 offset-s2' height='1000' width='1618' ref='canvas'></canvas>
        <div className='top-margin controls col s8 offset-s2'>
          <div className='col center-align s6 l3'>
            <label htmlFor='observation-count'>Observations:</label>
            <select
                className='browser-default'
                name='observation-count'
                ref='observation-count'
                onChange={this.handleObservationCountChange.bind(this)}
                defaultValue='100'
                disabled={this.state.running}>
              <option value='10'>10</option>
              <option value='100'>100</option>
              <option value='1000'>1,000</option>
              <option value='10000'>10,000</option>
            </select>
          </div>
          <div className='col center-align s6 l3'>
            <label htmlFor='cluster-count'>Clusters:</label>
            <select
                className='browser-default'
                name='cluster-count'
                ref='cluster-count'
                onChange={this.handleClusterCountChange.bind(this)}
                defaultValue='5'
                disabled={this.state.running}>
              <option value='2'>2</option>
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='20'>20</option>
            </select>
          </div>
          <div className='col center-align s4 l2'>
            <a
                className='btn-flat waves-effect form-btn'
                onClick={this.handleStart.bind(this)}
                disabled={this.state.running}>
              <i className="material-icons">play_arrow</i>
            </a>
          </div>
          <div className='col center-align s4 l2'>
            <a
                className='btn-flat waves-effect form-btn'
                onClick={this.handleReset.bind(this)}
                disabled={this.state.running}>
              <i className="material-icons">replay</i>
            </a>
          </div>
          <div className='col center-align s4 l2'>
            <a
                className='btn-flat waves-effect form-btn'
                onClick={this.handleStop.bind(this)}
                disabled={!this.state.running}>
              <i className="material-icons">stop</i>
            </a>
          </div>
        </div>
        <div className='top-margin subtext col s8 offset-s2 center'>{this.getSubtext()}</div>
      </div>
    )
  }
}

module.exports = Kmeans;
