var setStyleAttributes = (ctx, options) => {
  var stroke = options.stroke || { width: 1, style: '#000' }
  ctx.strokeStyle = stroke.style;
  ctx.lineWidth = stroke.width;
  var fill = options.fill || { style: '#000' }
  ctx.fillStyle = fill.style;
  var shadow = options.shadow || {
    color: '#333',
    blur: 0,
    offset: {x: 0, y: 0}
  }
  ctx.shadowColor = shadow.color;
  ctx.shadowBlur = shadow.blur;
  ctx.shadowOffsetX = shadow.offset.x;
  ctx.shadowOffsetY = shadow.offset.y;
  var rotate = (options.rotate || 0) * Math.PI/180.0;
  ctx.rotate(rotate);
};

var reset = (ctx) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

var Drawing = {
  line: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    ctx.moveTo(options.start.x, options.start.y);
    ctx.lineTo(options.finish.x, options.finish.y);
    ctx.stroke();
    reset(ctx);
  },

  ring: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    ctx.arc(
      options.center.x,
      options.center.y,
      options.radius,
      0,
      2 * Math.PI
    );
    ctx.stroke();
    reset(ctx);
  },

  disc: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    ctx.arc(
      options.center.x,
      options.center.y,
      options.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
    reset(ctx);
  },

  circle: (ctx, options) => {
    ctx.beginPath();
    setStyleAttributes(ctx, options);
    ctx.arc(
      options.center.x,
      options.center.y,
      options.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();
    reset(ctx);
  },

  rectangle: (ctx, options) => {
    setStyleAttributes(ctx, options);
    if (options.finish) {
      options.width = options.finish.x - options.start.x;
      options.height = options.finish.y - options.start.y;
    }
    ctx.fillRect(
      options.start.x,
      options.start.y,
      options.width,
      options.height
    );
    reset(ctx);
  }
}

module.exports = Drawing;
