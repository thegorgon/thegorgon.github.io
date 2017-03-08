var React = require('react');
var $ = require('jquery');
var Drawing = require('../drawing')
var Geometry = require('../geometry')
window.Geometry = Geometry;

class Swarm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      swarmers: [],
      predators: [],
      running: false,
      drawZones: false,
      swarmSize: 200,
      swarmMechanic: 'metric',
      speed: 5,
      angularVisibility: 3*Math.PI/4,
      repulsionRadius: 25,
      alignmentRadius: 100,
      attractionRadius: 1000,
      predatorRadius: 500
    };
  }

  handleResetAll() {
    var swarmers = [];
    for (var i = 0; i < this.state.swarmSize; i++) {
      swarmers.push({
        x: Math.floor(Math.random() * this.refs.canvas.width),
        y: Math.floor(Math.random() * this.refs.canvas.height),
        heading: Math.floor(Math.random() * 2.0 * Math.PI)
      })
    }
    this.setState({ swarmers: swarmers });
  }

  handleSpeedChange() {
    this.setState({
      speed: $(this.refs['speed-select']).val()
    });
  }

  handleZoneDrawingChange() {
    this.setState({
      drawZones: $(this.refs['draw-zones']).val() == 'yes'
    });
  }

  handleSwarmMechanicChange() {
    this.setState({
      swarmMechanic: $(this.refs['swarm-mechanic']).val()
    });
  }

  handleClearPredators() {
    this.setState({ predators: [] });
  }

  handleClick(event) {
    var canvas = this.refs.canvas;
    var offset = $(canvas).offset();
    var relX = (event.pageX - offset.left - 10) * canvas.width/$(canvas).width();
    var relY = (event.pageY - offset.top) * canvas.height/$(canvas).height();
    this.setState((prevState) => {
      return {
        predators: [{ x: relX, y: relY }].concat(prevState.predators)
      }
    });
  }

  metricVisible(swarmer, others) {
    return Geometry.within(swarmer, others, this.state.attractionRadius);
  }

  topologicalVisible(swarmer, others) {
    return Geometry.kNearest(swarmer, others, 6);
  }

  moveSwarm() {
    var angularSpeedMultiplier = 0.005 * Math.PI;
    var swarmers = [], others, visible, repulsionSwarm, alignmentSwarm, attractionSwarm, heading, centroid, avgHeading, destination, visiblePredators;
    this.state.swarmers.forEach((swarmer, index) => {
      others = this.state.swarmers.slice(0, index).concat(this.state.swarmers.slice(index + 1, this.state.swarmers.length));
      switch(this.state.swarmMechanic) {
        case 'metric':
          visible = this.metricVisible(swarmer, others);
          break;
        case 'topological':
          visible = this.topologicalVisible(swarmer, others);
          break;
        default:
          console.warn("WTF!");
      }
      visiblePredators = Geometry.within(swarmer, this.state.predators, this.state.predatorRadius);
      repulsionSwarm = Geometry.between(swarmer, visible, 0, this.state.repulsionRadius);
      alignmentSwarm = Geometry.between(swarmer, visible, this.state.repulsionRadius, this.state.alignmentRadius);
      attractionSwarm = Geometry.between(swarmer, visible, this.state.alignmentRadius, this.state.attractionRadius);
      heading = swarmer.heading;
      if (visiblePredators.length > 0) {
        centroid = Geometry.centroid(visiblePredators);
        heading = heading - this.state.speed * angularSpeedMultiplier * Math.sign();
        destination = Geometry.forward({
          x: swarmer.x,
          y: swarmer.y,
          heading: Geometry.heading(centroid, swarmer)
        }, 3 * this.state.speed);
      } else {
        if (repulsionSwarm.length > 0) {
          centroid = Geometry.centroid(repulsionSwarm);
          heading = heading + this.state.speed * angularSpeedMultiplier * Math.sign(Geometry.heading(centroid, swarmer));
        } else {
          avgHeading = heading;
          if (alignmentSwarm.length > 0) {
            avgHeading = Geometry.averageHeading(alignmentSwarm);
          }
          if ((Math.abs(avgHeading - heading) > Math.PI/5000.0)) {
            heading = heading + this.state.speed * angularSpeedMultiplier * Math.sign(avgHeading - heading);
          } else if (attractionSwarm.length > 0) {
            centroid = Geometry.centroid(attractionSwarm);
            heading = heading + this.state.speed * angularSpeedMultiplier * Math.sign(Geometry.heading(swarmer, centroid));
          }
        }
        destination = Geometry.forward({
          x: swarmer.x,
          y: swarmer.y,
          heading: heading
        }, this.state.speed);
      }
      if (destination.x < 0) { destination.x = this.refs.canvas.width; }
      if (destination.x > this.refs.canvas.width) { destination.x = 0; }
      if (destination.y < 0) { destination.y = this.refs.canvas.height; }
      if (destination.y > this.refs.canvas.height) { destination.y = 0; }
      swarmers.push(destination);
    });
    this.setState({ swarmers: swarmers });
  }

  handleStart() {
    this.interval = setInterval(this.moveSwarm.bind(this), 10);
    this.setState({ running: true });
  }

  handleStop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.setState({ running: false });
  }

  componentDidMount() {
    this.handleResetAll();
    this.handleStart();
  }

  componentWillUnmount() {
    this.handleStop();
  }

  componentDidUpdate(prevProps, prevState) {
    var canvas = this.refs.canvas;
    var ctx = canvas.getContext('2d');
    Drawing.clear(ctx);

    this.state.predators.forEach((predator, index) => {
      Drawing.disc(ctx, {
        fill: { style: 'rgba(255, 0, 0, 0.25)' },
        center: predator,
        nRadius: 0.5
      })
    });

    this.state.swarmers.forEach((swarmer, index) => {
      Drawing.triangle(ctx, {
        center: swarmer,
        nWidth: 0.8,
        nHeight: 1,
        heading: swarmer.heading
      });
      if (this.state.drawZones && this.state.swarmMechanic == 'metric') {
        Drawing.sector(ctx, {
          fill: { style: 'rgba(255, 0, 0, 0.5)' },
          center: swarmer,
          radius: this.state.repulsionRadius,
          start: swarmer.heading - this.state.angularVisibility,
          finish: swarmer.heading + this.state.angularVisibility
        });
        Drawing.sector(ctx, {
          fill: { style: 'rgba(255, 0, 0, 0.25)' },
          center: swarmer,
          radius: this.state.alignmentRadius,
          start: swarmer.heading - this.state.angularVisibility,
          finish: swarmer.heading + this.state.angularVisibility
        });
      }
    });
  }

  render() {
    return (
      <div className='row kmeans'>
        <canvas onClick={this.handleClick.bind(this)} className='col s12 l10 offset-l1' height='2000' width='3236' ref='canvas'></canvas>
        <div className='top-margin controls col s12'>
          <div className='col center-align s4'>
            <label htmlFor='observation-count'>Speed:</label>
            <select className='browser-default'
                name='speed'
                ref='speed-select'
                onChange={this.handleSpeedChange.bind(this)}
                defaultValue='2'>
              <option value='0.2'>x-slow</option>
              <option value='1'>slow</option>
              <option value='2'>medium</option>
              <option value='5'>fast</option>
              <option value='10'>x-fast</option>
              <option value='20'>xx-fast</option>
            </select>
          </div>
          <div className='col center-align s4'>
            <label htmlFor='observation-count'>Draw Zones:</label>
            <select className='browser-default'
                name='draw-zones'
                ref='draw-zones'
                onChange={this.handleZoneDrawingChange.bind(this)}
                defaultValue='no'>
              <option value='yes'>yes</option>
              <option value='no'>no</option>
            </select>
          </div>
          <div className='col center-align s4'>
            <label htmlFor='observation-count'>Mechanic:</label>
            <select className='browser-default'
                name='swarm-mechanic'
                ref='swarm-mechanic'
                onChange={this.handleSwarmMechanicChange.bind(this)}
                defaultValue='metric'>
              <option value='metric'>metric</option>
              <option value='topological'>topological</option>
            </select>
          </div>
          <div className='col center-align s3'>
            <a className='btn-flat waves-effect form-btn'
                onClick={this.handleStart.bind(this)}
                disabled={this.state.running}>
              <i className="material-icons">play_arrow</i>
            </a>
          </div>
          <div className='col center-align s3'>
            <a className='btn-flat waves-effect form-btn'
                onClick={this.handleStop.bind(this)}
                disabled={!this.state.running}>
              <i className="material-icons">stop</i>
            </a>
          </div>
          <div className='col center-align s3'>
            <a className='btn-flat waves-effect form-btn'
                onClick={this.handleResetAll.bind(this)}>
              <i className="material-icons">replay</i>
            </a>
          </div>
          <div className='col center-align s3'>
            <a className='btn-flat waves-effect form-btn'
                onClick={this.handleClearPredators.bind(this)}>
              <i className="material-icons">not_interested</i>
            </a>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = Swarm;
