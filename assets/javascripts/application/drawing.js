var Drawing = {
  line: (ctx, options) => {
    ctx.beginPath();
    ctx.fillStyle = options.fill;
    ctx.moveTo(options.start.x, options.start.y);
    ctx.lineTo(options.finish.x, options.finish.y);
    ctx.stroke();
  }
}

module.exports = Drawing;
