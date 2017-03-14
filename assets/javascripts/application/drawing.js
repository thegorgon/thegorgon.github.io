var buildGradient = (ctx, options) => {
  var gradient;
  if (options.type == 'linear') {
    var start = normalizePoint(options.start, ctx);
    var finish = normalizePoint(options.finish, ctx);
    gradient = ctx.createLinearGradient(start.x, start.y, finish.x, finish.y);
  } else if (options.type == 'radial') {
    var startCenter = normalizePoint(options.start.center, ctx);
    var finishCenter = normalizePoint(options.finish.center, ctx);
    var startRadius = normalizeRadius(options.start, ctx);
    var finishRadius = normalizeRadius(options.finish, ctx);
    gradient = ctx.createRadialGradient(startCenter.x, startCenter.y, startRadius, finishCenter.x, finishCenter.y, finishRadius);
  }
  if (gradient) {
    options.stops.forEach((stop) => {
      gradient.addColorStop(stop.position, stop.color);
    });
  }
  return gradient;
}

var polygon = (ctx, options) => {
  setStyleAttributes(ctx, options);
  var points = options.points.map((point) => {
    return normalizePoint(point, ctx);
  });
  var start = points[0];
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  points.slice(1).forEach((point) => {
    ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fill();
  reset(ctx);
}

var setStyleAttributes = (ctx, options) => {
  ctx.font = options.font;
  var shadow = options.shadow || {
    color: '#333',
    blur: 0,
    offset: {x: 0, y: 0}
  }
  var shadowOffset = normalizePoint(shadow.offset || {x: 0, y: 0}, ctx);
  ctx.shadowColor = shadow.color;
  ctx.shadowBlur = normalizeBlur(shadow, ctx);
  ctx.shadowOffsetX = shadowOffset.x;
  ctx.shadowOffsetY = shadowOffset.y;
  var rotate = (options.rotate || 0) * Math.PI/180.0;
  ctx.rotate(rotate);
  var stroke = options.stroke || { width: 1, style: '#000' }
  if (stroke.gradient) {
    ctx.strokeStyle = buildGradient(ctx, stroke.gradient);
  } else {
    ctx.strokeStyle = stroke.style;
  }
  ctx.lineWidth = normalizeWidth(stroke, ctx);
  var fill = options.fill || { style: '#000' }
  if (fill.gradient) {
    ctx.fillStyle = buildGradient(ctx, fill.gradient);
  } else {
    ctx.fillStyle = fill.style;
  }
};

var reset = (ctx) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

var normalizePoint = (point, ctx) => {
  if (!point) { return null; }
  var canvas = ctx.canvas;
  var normalized = {x: point.x, y: point.y};
  if (typeof(point.nX) == 'number') {
    normalized.x = ctx.canvas.width * point.nX * 0.01;
  }

  if (typeof(point.nY) == 'number') {
    normalized.y = ctx.canvas.height * point.nY * 0.01;
  }

  return normalized;
};

var normalizeRadius = (options, ctx) => {
  var radius = options.radius;
  if (options.nRadius) { radius = ctx.canvas.width * options.nRadius/100.0; }
  return radius;
}

var normalizeWidth = (options, ctx) => {
  var width = options.width;
  if (options.nWidth) { width = ctx.canvas.width * options.nWidth/100.0; }
  return width;
}

var normalizeHeight = (options, ctx) => {
  var height = options.height;
  if (options.nHeight) { height = ctx.canvas.height * options.nHeight/100.0; }
  return height;
}

var normalizeBlur = (options, ctx) => {
  var blur = options.blur;
  if (options.nBlur) { blur = ctx.canvas.width * options.nBlur/100.0; }
  return blur;
}

var Drawing = {
  bindDebug: ($, canvas) => {
    $(canvas).click(((event) => {
      var ctx = canvas.getContext('2d');
      var offset = $(canvas).offset();
      var relX = Math.round((event.pageX - offset.left - 10) * canvas.width/$(canvas).width() * 10.0) * 0.1;
      var relY = Math.round((event.pageY - offset.top) * canvas.height/$(canvas).height() * 10.0) * 0.1;
      var nX = Math.round(relX/(canvas.width * 0.001)) * 0.1;
      var nY = Math.round(relY/(canvas.height * 0.001)) * 0.1;
      console.log("Clicked at: { x: ", relX, ", y: ", relY, ", nX:", nX, ", nY: ", nY, " }");
    }));
  },

  clear: (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  },

  text: (ctx, options) => {
    setStyleAttributes(ctx, options);
    var position = normalizePoint(options.position, ctx);
    ctx.fillText(options.text, position.x, position.y);
    reset(ctx);
  },

  line: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    var start = normalizePoint(options.start, ctx);
    var finish = normalizePoint(options.finish, ctx);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(finish.x, finish.y);
    ctx.stroke();
    reset(ctx);
  },

  arc: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    var center = normalizePoint(options.center, ctx);
    var radius = normalizeRadius(options, ctx);
    ctx.arc(
      center.x,
      center.y,
      radius,
      options.start,
      options.finish
    );
    ctx.stroke();
    reset(ctx);
  },

  sector: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    var center = normalizePoint(options.center, ctx);
    var radius = normalizeRadius(options, ctx);
    var startPt = {
      x: center.x + radius * Math.cos(options.start),
      y: center.y + radius * Math.sin(options.start)
    };
    var endPt = {
      x: center.x + radius * Math.cos(options.finish),
      y: center.y + radius * Math.sin(options.finish)
    };
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(startPt.x, startPt.y);
    ctx.arc(
      center.x,
      center.y,
      radius,
      options.start,
      options.finish
    );
    ctx.moveTo(endPt.x, endPt.y);
    ctx.lineTo(center.x, center.y);
    ctx.fill();
    reset(ctx);
  },

  ring: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    var center = normalizePoint(options.center, ctx);
    var radius = normalizeRadius(options, ctx);
    ctx.arc(
      center.x,
      center.y,
      radius,
      0,
      2 * Math.PI
    );
    ctx.stroke();
    reset(ctx);
  },

  disc: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    var center = normalizePoint(options.center, ctx);
    var radius = normalizeRadius(options, ctx);
    ctx.arc(
      center.x,
      center.y,
      radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
    reset(ctx);
  },

  circle: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    var center = normalizePoint(options.center, ctx);
    var radius = normalizeRadius(options, ctx);
    ctx.arc(
      center.x,
      center.y,
      radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();
    reset(ctx);
  },

  triangle: (ctx, options) => {
    var center = normalizePoint(options.center, ctx);
    var width = normalizeWidth(options, ctx);
    var height = normalizeHeight(options, ctx);
    var x = center.x, y = center.y, theta = options.heading + Math.PI/2.0, h = height * 0.5, w = width * 0.5;

    polygon(ctx, Object.assign({}, {
      points: [
        { x: x + h * Math.sin(theta), y: y - h * Math.cos(theta) },
        { x: x - h * Math.sin(theta) - w * Math.cos(theta), y: y + h * Math.cos(theta) - w * Math.sin(theta) },
        { x: x - h * Math.sin(theta) + w * Math.cos(theta), y: y + h * Math.cos(theta) + w * Math.sin(theta) }
      ]
    }, options));
  },

  rectangle: (ctx, options) => {
    setStyleAttributes(ctx, options);
    var start = normalizePoint(options.start, ctx);
    var finish = normalizePoint(options.finish, ctx);
    var width = normalizeWidth(options, ctx);
    var height = normalizeHeight(options, ctx);
    if (options.finish) {
      width = finish.x - start.x;
      height = finish.y - start.y;
    }
    ctx.fillRect(
      start.x,
      start.y,
      width,
      height
    );
    reset(ctx);
  },

  polygon: (ctx, options) => {
    polygon(ctx, options)
  },

  image: (ctx, options) => {
    var start = normalizePoint(options.start, ctx);
    var finish = normalizePoint(options.finish, ctx);
    var width = normalizeWidth(options, ctx);
    var height = normalizeHeight(options, ctx);
    if (options.finish) {
      width = finish.x - start.x;
      height = finish.y - start.y;
    }
    var image = new Image(width, height);
    image.src = options.src;
    debugger;
    ctx.drawImage(
      image,
      start.x,
      start.y,
      width,
      height
    )
  }
}

module.exports = Drawing;
