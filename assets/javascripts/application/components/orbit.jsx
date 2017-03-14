var React = require('react');
var $ = require('jquery');
var Drawing = require('../drawing')

class Orbit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      speed: 1,
      running: true,
      earth: { x: 0, y: 0 },
      moon: { x: 100, y: 0 }
    };
  }

  handleResetAll() {
    this.setState({});
  }

  handleSpeedChange() {
    this.setState({
      speed: $(this.refs['speed-select']).val()
    });
  }

  updateOrbit() {

  }

  handleStart() {
    this.interval = setInterval(this.updateOrbit.bind(this), 10);
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

    Drawing.image(ctx, {
      src: '/assets/images/earth.jpg',
      start: {
        x: this.state.earth.x + canvas.width * 0.5 - 20,
        y: this.state.earth.y + canvas.height * 0.5 - 20
      },
      width: 20,
      height: 20
    });

    Drawing.image(ctx, {
      src: '/assets/images/moon.jpg',
      start: {
        x: this.state.moon.x + canvas.width * 0.5 - 20,
        y: this.state.moon.y + canvas.height * 0.5 - 20
      },
      width: 20,
      height: 20
    });
  }

  render() {
    return (
      <div className='row orbit'>
        <canvas className='col s12 l10 offset-l1' height='2000' width='3236' ref='canvas'></canvas>
        <div className='top-margin controls col s12'>
          <div className='col center-align s3'>
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
        </div>
      </div>
    )
  }
}

module.exports = Orbit;
