var React = require('react');
var $ = require('jquery');
var Drawing = require('../drawing')

String.prototype.lpad = function(length){
  var accum = this;
  while (accum.length < length) {
    accum = '0' + accum;
  }
  return accum;
}
Number.prototype.lpad = function(length){
  return String(this).lpad(length);
}

class Clock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      time: new Date(),
      style: 'basic'
    };
  }

  componentDidMount() {
    this.interval = setInterval((() => {
      this.setState({
        time:  new Date()
      })
    }).bind(this), 1);
    Drawing.bindDebug($, this.refs.canvas);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    var canvas = this.refs.canvas;
    var seconds = this.state.time.getSeconds();
    if (this.state.style != 'retro') {
      seconds += this.state.time.getMilliseconds() * 0.001;
    }
    var minutes = this.state.time.getMinutes() + seconds/60.0;
    var hours = this.state.time.getHours() + minutes/60.0;
    var data = {
      ctx: canvas.getContext('2d'),
      width: canvas.width,
      height: canvas.height,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    }
    data.ctx.clearRect(0, 0, data.width, data.height);

    switch (this.state.style) {
      case 'basic':
        this.renderBasicClock(data); break;
      case 'retro':
        this.renderRetroClock(data); break;
      case 'movado':
        this.renderMovadoClock(data); break;
      case 'classic':
        this.renderClassicClock(data); break;
      default:
        console.log('ERROR: INVALID STYLE ', this.state.style);
    }
  }

  renderBasicClock(data) {
    var r, r1, r2, theta, x, y;
    Drawing.ring(data.ctx, {
      center: { nX: 50, nY: 50 },
      nRadius: 25
    });

    for (var i = 0; i < 12; i++) {
      r1 = data.width * 0.20;
      r2 = data.width * 0.23;
      theta = i * (2 * Math.PI)/12.0 - Math.PI/2.0;
      Drawing.line(data.ctx, {
        start: {
          x: r1 * Math.cos(theta) + data.width * 0.5,
          y: r1 * Math.sin(theta) + data.height * 0.5
        },
        finish: {
          x: r2 * Math.cos(theta) + data.width * 0.5,
          y: r2 * Math.sin(theta) + data.height * 0.5
        }
      });
    }

    // second hand
    r = data.width * 0.22;
    theta = data.seconds * (2 * Math.PI)/60.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      start: {
        x: data.width * 0.5,
        y: data.height * 0.5
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      }
    });

    // minute hand
    r = data.width * 0.20;
    theta = data.minutes * (2 * Math.PI)/60.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      start: {
        x: data.width * 0.5,
        y: data.height * 0.5
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      }
    });

    // hour hand
    r = data.width * 0.125;
    theta = (data.hours % 12) * (2 * Math.PI)/12.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      start: {
        x: data.width * 0.5,
        y: data.height * 0.5
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      }
    });
  }

  renderRetroClock(data) {
    var r, theta, x, y;

    // Clock face
    Drawing.ring(data.ctx, {
      stroke: {
        style: '#fff',
        width: 10
      },
      shadow: {
        color: '#333',
        blur: 2,
        offset: {
          x: 1,
          y: 1
        }
      },
      center: { nX: 50, nY: 50 },
      nRadius: 25
    });

    // Blue disc at bottom left of face
    Drawing.disc(data.ctx, {
      fill: {
        style: '#00f',
      },
      center: { nX: 42, nY: 77 },
      radius: 12
    });

    // Square to right of center of face
    Drawing.line(data.ctx, {
      stroke: {
        style: '#444',
        width: 20
      },
      start: { nX: 55, nY: 52 },
      finish: { nX: 57.5, nY: 53 }
    });

    // Red line of 3 line design at bottom left of face.
    Drawing.line(data.ctx, {
      stroke: {
        style: '#f00',
        width: 13
      },
      start: { nX: 37, nY: 63 },
      finish: { nX: 52, nY: 74 }
    });

    // Blue line of 3 line design at bottom left of face.
    Drawing.line(data.ctx, {
      stroke: {
        style: '#00f',
        width: 7
      },
      start: { nX: 30, nY: 53 },
      finish: { nX: 50,  nY: 67.5 }
    });

    // Yellow line of 3 line design at bottom left of face.
    Drawing.line(data.ctx, {
      stroke: {
        style: '#ffdf00',
        width: 15
      },
      start: { nX: 43.0, nY: 59 },
      finish: { nX: 39, nY: 73 }
    });

    // Red line at top of face.
    Drawing.line(data.ctx, {
      stroke: {
        style: '#f00',
        width: 7
      },
      start: { nX: 47.5, nY: 12.5 },
      finish: { nX: 52, nY: 30 }
    });

    // 3 black dots at bottom right of face
    [ {x: 64.0, y: 70},
      {x: 64.7, y: 75},
      {x: 67.0, y: 72}
    ].map((center) => {
      Drawing.disc(data.ctx, {
        fill: {
          style: '#333'
        },
        radius: 7,
        center: {
          nX: center.x,
          nY: center.y
        }
      })
    });

    // 3 green quadrilateral to left of center of face, left to right.
    // #1
    var green = 'rgba(17, 140, 121, 1)';
    Drawing.polygon(data.ctx, {
      fill: {
        style: green
      },
      points: [
        {nX: 39.5, nY: 26.7},
        {nX: 37.4, nY: 38.2},
        {nX: 39.7, nY: 37.4},
        {nX: 41.7, nY: 27.5}
      ]
    });

    // #2
    Drawing.polygon(data.ctx, {
      fill: {
        style: green
      },
      points: [
        {nX: 43.0, nY: 28.0},
        {nX: 41.2, nY: 37.1},
        {nX: 43.6, nY: 36.1},
        {nX: 45.0, nY: 28.8}
      ]
    });

    // #3
    Drawing.polygon(data.ctx, {
      fill: {
        style: green
      },
      points: [
        {nX: 46.1, nY: 29.2},
        {nX: 45.0, nY: 35.7},
        {nX: 47.2, nY: 35.0},
        {nX: 48.0, nY: 30.1}
      ]
    });

    // Green arc
    for (var i = 0; i < 4; i++) {
      Drawing.arc(data.ctx, {
        stroke: {
          style: green,
          width: 8
        },
        nRadius: 17,
        center: { nX: 50, nY: 50 },
        start: Math.PI/(-2) + Math.PI/16 * (i - 0.25) + Math.PI/6,
        finish: Math.PI/(-2) + Math.PI/16 * (i + 0.25) + Math.PI/6
      });
    }

    // Brand name
    Drawing.text(data.ctx, {
      fill: {
        style: 'rgba(0,0,255,0.7)'
      },
      font: '100 small-caps 18px "Trebuchet MS", Helvetica, sans-serif',
      text: 'swiss',
      position: { nX: 67.5, nY: 51.5}
    })

    // hour hand
    r = data.width * 0.13;
    theta = (data.hours % 12) * (2 * Math.PI)/12.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      stroke: {
        style: '#ffdf00',
        width: 12
      },
      start: {
        x: data.width * 0.5 - 0.1 * r * Math.cos(theta),
        y: data.height * 0.5 - 0.1 * r * Math.sin(theta)
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      },
      shadow: {
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 2,
        offset: {
          x: 2,
          y: 2
        }
      },
    });

    // minute hand
    r = data.width * 0.20;
    theta = data.minutes * (2 * Math.PI)/60.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      stroke: {
        style: '#f00',
        width: 8
      },
      start: {
        x: data.width * 0.5 - 0.1 * r * Math.cos(theta),
        y: data.height * 0.5 - 0.1 * r * Math.sin(theta)
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      },
      shadow: {
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 4,
        offset: {
          x: 4,
          y: 4
        }
      },
    });

    // second hand
    r = data.width * 0.22;
    theta = data.seconds * (2 * Math.PI)/60.0 - Math.PI/2.0;
    Drawing.line(data.ctx, {
      stroke: {
        style: '#00f',
        width: 4
      },
      start: {
        x: data.width * 0.5 - 0.1 * r * Math.cos(theta),
        y: data.height * 0.5 - 0.1 * r * Math.sin(theta)
      },
      finish: {
        x: r * Math.cos(theta) + data.width * 0.5,
        y: r * Math.sin(theta) + data.height * 0.5
      },
      shadow: {
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 6,
        offset: {
          x: 5,
          y: 5
        }
      },
    });

    // Center pin.
    Drawing.circle(data.ctx, {
      fill: {
        style: '#eee'
      },
      stroke: {
        style: '#333',
        width: 2
      },
      center: {
        x: data.width * 0.5,
        y: data.height * 0.5,
      },
      radius: 6
    });
  }

  renderMovadoClock(data) {

  }

  renderClassicClock(data) {

  }

  setStyleHandler(style) {
    return (() => {
      this.setState({
        style: style
      });
    }).bind(this);
  }

  render() {
    return (
      <div className='row clock'>
        <div className='col s4 offset-s4 digital flow-text'>
          <span className='hours'>{this.state.time.getHours().lpad(2)}</span>
          <span className='divider'>:</span>
          <span className='minutes'>{this.state.time.getMinutes().lpad(2)}</span>
          <span className='divider'>:</span>
          <span className='seconds'>{this.state.time.getSeconds().lpad(2)}</span>
        </div>
        <canvas className='col s8 offset-s2' height='500' width='809' ref='canvas'></canvas>
        <div className='controls col s12'>
          <div className='toggle col s12'>
            <div className='title'>style</div>
            <div className={'col s6 btn-flat waves-effect ' + (this.state.style == 'basic' ? 'active' : 'inactive')}
                onClick={this.setStyleHandler('basic')}>
                basic
            </div>
            <div className={'col s6 btn-flat waves-effect ' + (this.state.style == 'retro' ? 'active' : 'inactive')}
                onClick={this.setStyleHandler('retro')}>
                retro
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Clock;
