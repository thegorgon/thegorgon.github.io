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
      speed: 5,
      angularVisibility: Math.PI/2.0,
      repulsionRadius: 50,
      alignmentRadius: 100,
      attractionRadius: 500,
      predatorRadius: 500
    };
  }

  handleResetAll() {
    var swarmers = [];
    for (var i = 0; i < this.state.swarmSize; i++) {
      swarmers.push({
        x: Math.floor(Math.random() * this.refs.canvas.width),
        y: Math.floor(Math.random() * this.refs.canvas.height),
        heading: Math.floor(Math.random() * 2.0 * Math.PI),
        color: '#000'
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

  handleVisibilityChange() {
    this.setState({
      angularVisibility: parseFloat($(this.refs['angular-visibility']).val())
    });
  }

  handleClick(event) {
    var canvas = this.refs.canvas;
    var offset = $(canvas).offset();
    var relX = (event.pageX - offset.left - 10) * canvas.width/$(canvas).width();
    var relY = (event.pageY - offset.top) * canvas.height/$(canvas).height();
    this.setState((prevState) => {
      return {
        predators: [{ x: relX, y: relY, created: (new Date()).getTime() }].concat(prevState.predators)
      }
    });
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  filterPredators() {
    var now = (new Date()).getTime();
    return this.state.predators.filter((predator) => {
      return predator.created > now - 500; // Last for half a second
    });
  }

  moveSwarm() {
    var swarmers = [], others, visible, visibleSwarm, repulsionSwarm, alignmentSwarm, attractionSwarm, desiredHeading, heading, destination, visiblePredators, color, rotationalSpeed, speed;
    this.state.swarmers.forEach((swarmer, index) => {
      others = this.state.swarmers.slice(0, index).concat(this.state.swarmers.slice(index + 1, this.state.swarmers.length));
      visible = Geometry.withinAngle(swarmer, others, this.state.angularVisibility);
      visiblePredators = Geometry.withinAngleAndDistance(swarmer, this.state.predators, this.state.angularVisibility, this.state.predatorRadius);
      speed = this.state.speed;
      rotationalSpeed = 0.005 * Math.PI * speed;
      desiredHeading = swarmer.heading;
      if (visiblePredators.length > 0) {
        desiredHeading = Geometry.heading(Geometry.kNearest(swarmer, visiblePredators, 1)[0], swarmer);
        rotationalSpeed = rotationalSpeed;
        speed = speed * 2;
        color = '#8E2800';
      } else {
        repulsionSwarm = Geometry.within(swarmer, visible, this.state.repulsionRadius);
        alignmentSwarm = Geometry.within(swarmer, visible, this.state.alignmentRadius);
        attractionSwarm = Geometry.within(swarmer, visible, this.state.attractionRadius);
        if (repulsionSwarm.length > 0) {
          desiredHeading = Geometry.heading(Geometry.centroid(repulsionSwarm), swarmer);
          color = '#FFB03B';
        } else {
          if (alignmentSwarm.length > 0) {
            desiredHeading = Geometry.averageHeading(alignmentSwarm);
          }
          if (desiredHeading != heading) {
            color = '#2C5640';
          } else if (attractionSwarm.length > 0) {
            desiredHeading = Geometry.heading(swarmer, Geometry.centroid(attractionSwarm));
            color = '#1BE6EF';
          }
        }
      }
      heading = this.calculateNewHeading(swarmer.heading, desiredHeading, rotationalSpeed);
      destination = Geometry.forward({
        x: swarmer.x,
        y: swarmer.y,
        heading: heading
      }, speed);
      destination = this.wrapPosition(destination, rotationalSpeed);
      swarmers.push(Object.assign({}, destination, { color: color }));
    });
    this.setState({ swarmers: swarmers, predators: this.filterPredators() });
  }

  calculateNewHeading(curHeading, desiredHeading, rotationalSpeed) {
    return curHeading + Math.sign(desiredHeading - curHeading) * Math.min(rotationalSpeed, Math.abs(desiredHeading - curHeading));
  }

  wrapPosition(destination, rotationalSpeed) {
    var width = this.refs.canvas.width, height = this.refs.canvas.height;
    if (destination.x < 0) {
      destination.x = width;
    }
    if (destination.x > width) {
      destination.x = 0;
    }
    if (destination.y < 0) {
      destination.y = height;
    }
    if (destination.y > height) {
      destination.y = 0;
    }
    return destination;
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

    this.state.swarmers.forEach((swarmer, index) => {
      Drawing.triangle(ctx, {
        fill: { style: swarmer.color },
        center: swarmer,
        nWidth: 0.6,
        nHeight: 1,
        heading: swarmer.heading
      });
      if (this.state.drawZones) {
        Drawing.sector(ctx, {
          fill: { style: 'rgba(255, 0, 0, 0.5)' },
          center: swarmer,
          radius: this.state.repulsionRadius,
          start: swarmer.heading - this.state.angularVisibility,
          finish: swarmer.heading + this.state.angularVisibility
        });
        Drawing.sector(ctx, {
          fill: { style: 'rgba(255, 0, 0, 0.2)' },
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
      <div className='row swarm'>
        <canvas onClick={this.handleClick.bind(this)} className='col s12 l10 offset-l1' height='2000' width='3236' ref='canvas'></canvas>
        <div className='top-margin controls col s12'>
          <div className='col center-align s4'>
            <label htmlFor='observation-count'>Speed:</label>
            <select className='browser-default'
                name='speed'
                ref='speed-select'
                onChange={this.handleSpeedChange.bind(this)}
                defaultValue={this.state.speed}>
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
                defaultValue={this.state.drawZones ? 'yes' : 'no'}>
              <option value='yes'>yes</option>
              <option value='no'>no</option>
            </select>
          </div>
          <div className='col center-align s4'>
            <label htmlFor='observation-count'>Visibility:</label>
            <select className='browser-default'
                name='angular-visibility'
                ref='angular-visibility'
                onChange={this.handleVisibilityChange.bind(this)}
                defaultValue={this.state.angularVisibility}>
              <option value={0}>none</option>
              <option value={Math.PI/4.0}>narrow</option>
              <option value={Math.PI/2.0}>forward</option>
              <option value={3*Math.PI/4.0}>wide</option>
              <option value={Math.PI}>full</option>
            </select>
          </div>
          <div className='col center-align s4'>
            <a className='btn-flat waves-effect form-btn'
                onClick={this.handleStart.bind(this)}
                disabled={this.state.running}>
              <i className="material-icons">play_arrow</i>
            </a>
          </div>
          <div className='col center-align s4'>
            <a className='btn-flat waves-effect form-btn'
                onClick={this.handleStop.bind(this)}
                disabled={!this.state.running}>
              <i className="material-icons">stop</i>
            </a>
          </div>
          <div className='col center-align s4'>
            <a className='btn-flat waves-effect form-btn'
                onClick={this.handleResetAll.bind(this)}>
              <i className="material-icons">replay</i>
            </a>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = Swarm;
