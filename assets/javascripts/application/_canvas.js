window.Gorgon = window.Gorgon || {};
window.Gorgon.Canvas = function(canvas) {
  this.canvas = canvas;
  if ($.isFunction(this.canvas.getContext)) {
    this.context = this.canvas.getContext('2d');
  } else {
    alert("Canvas is not supported in your browser.");
  }
};
window.Gorgon.Canvas.prototype = {
  drawPoint: function(x, y, r, color) {
    this.context.beginPath();
    this.context.fillStyle = color;
    this.context.moveTo(x,y);
    this.context.arc(x, y, r, 0, 2 * Math.PI, true);
    this.context.fill();
  },
  drawLine: function(x1, y1, x2, y2, color) {
    this.context.strokeStyle = color;
    this.context.lineWidth = 1;
    this.context.beginPath();
    this.context.moveTo(x1,y1);
    this.context.lineTo(x2,y2);
    this.context.stroke();
  },
  drawText: function(text, color) {
    this.context.font = "20pt Helvetica";
    this.context.fillStyle = color || "#333";
    this.context.textAlign = "center";
    this.context.fillText(text, this.getWidth()*0.5, this.getHeight()*0.5);
  },
  drawSquare: function(center, length, color) {
    this.context.strokeStyle = color;
    this.context.strokeRect(center.x - length * 0.5,center.y - length * 0.5, length, length);
  },
  clear: function() {
    this.context.clearRect(0, 0, this.getWidth(), this.getHeight());
  },
  getWidth: function() {
    return this.canvas.width;
  },
  getHeight: function() {
    return this.canvas.height;
  }
}