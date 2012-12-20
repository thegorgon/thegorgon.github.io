window.Gorgon = window.Gorgon || {};
window.Gorgon.Kmeans = function(canvas) {
  this.canvas = canvas;
  this.interval = 100;
  this.pointCount = 0;
  this.clusterCount = 0;

  if ($.isFunction(this.canvas.getContext)) {
    this.context = this.canvas.getContext('2d');
  } else {
    alert("Canvas is not supported in your browser.");
  }
};
window.Gorgon.Kmeans.prototype = {
  drawPoint: function(x, y, r, color) {
    this.context.beginPath();
    this.context.fillStyle = color;
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
    this.context.fillText(text, this.canvas.width* 0.5, this.canvas.height*0.5);
  },
  drawClusterCenter: function(center) {
    this.drawPoint(center.x, center.y, 5, "#ff0000");
  },
  drawDataPoint: function(data) {
    this.drawPoint(data.x, data.y, 2, "#0000ff");
  },
  drawAssociation: function(data, center) {
    this.drawLine(data.x, data.y, center.x, center.y, "#00ff00");
  },
  setClusterCount: function(k) {
    this.clusterCount = parseInt(k, 10);
  },
  setPointCount: function(n) {
    this.pointCount = parseInt(n, 10);
  },
  setClusterGeneration: function(generation) {
    this.generation = generation;
  },
  setIterationInterval: function(interval) {
    this.interval = interval;
  },
  randomizePoints: function() {
    var maxX = this.canvas.width;
    var maxY = this.canvas.height;

    for (var i = 0; i < this.pointCount; i+=1) {
      var x = Math.random() * maxX;
      var y = Math.random() * maxY;
      this.points[i] = {x: x, y: y};
    }
  },
  randomizeClusters: function() {
    var generator = null;

    if (this.generation == "random") {
      generator = function(obj) {
        return {x: Math.random() * obj.canvas.width,
                y: Math.random() * obj.canvas.height}
      }
    } else if (this.generation == "forgy") {
      generator = function(obj) {
        var index = Math.round(Math.random() * obj.pointCount);
        return obj.points[index];
      }
    } else {
      throw "Unexpected generation scheme : " + this.generation;
    }

    this.pointAssignments = new Array(this.pointCount);
    this.clusters = new Array(this.clusterCount);
    this.clusterAssignments = new Array(this.clusterCount);
    for (var i = 0; i < this.clusterCount; i+=1) {
      this.clusters[i] = generator.call(this, this);
    }
  },
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  draw: function() {
    var kmeans = this, clusterCenter;
    kmeans.clear();
    var count = 0;
    $.each(kmeans.points, function(pointIdx) {
      kmeans.drawDataPoint(this);

      clusterCenter = kmeans.pointAssignments[pointIdx];
      if (clusterCenter) {
        count += 1
        kmeans.drawAssociation(this, clusterCenter);
      }
    });
    $.each(kmeans.clusters, function(clusterIdx) {
      kmeans.drawClusterCenter(this);
    });
  },
  getMeanValuePerExecution: function(key) {
    var sum = 0, count = 0, kmeans = this, value = null;
    if (kmeans.executions.length > 0) {
      $.each(kmeans.executions, function(index) {
        value = kmeans.executions[index];
        if (value && value[key]) {
          sum += value[key];
          count += 1;
        }
      });
      return (sum/count);
    } else {
      return 0;
    }
  },
  getMeanIterationsPerExecution: function() {
    return this.getMeanValuePerExecution('iterations');
  },
  getExecutionMeanDistanceBetweenPointsAndClusters: function() {
    return this.getMeanValuePerExecution('distance');
  },
  getIterationMeanDistanceBetweenPointsAndClusters: function() {
    var sum = 0, kmeans = this, point, cluster;
    $.each(kmeans.pointAssignments, function(index) {
      point = kmeans.points[index];
      cluster = kmeans.pointAssignments[index];
      sum += kmeans.distanceBetween(point, cluster);
    });

    if (kmeans.points.length > 0) {
      return (sum/kmeans.points.length)
    } else {
      return null;
    }
  },
  getExecutionIndex: function() {
    return this.executionIndex;
  },
  getExecutionHumanIndex: function() {
    return 1 + this.getExecutionIndex();
  },
  getIterationIndex: function() {
    return this.iterationIndex;
  },
  execute: function(count, callback) {
    count = parseInt(count, 10);
    this.executionIndex = 0;
    this.points = new Array(this.pointCount);
    this.pointAssignments = new Array(this.pointCount);
    this.clusters = new Array(this.clusterCount);
    this.clusterAssignments = new Array(this.clusterCount);
    this.executions = new Array(count);
    this.randomizePoints();
    this._executeHelper(count, callback)
  },
  _executeHelper: function(count, callback) {
    var kmeans = this;

    kmeans.iterationIndex = 0;
    kmeans.randomizeClusters();
    kmeans.draw();
    setTimeout(function() {
      kmeans.iterate(function(completed) {
        callback.call(this, completed);

        if (completed) {
          if (kmeans.executionIndex > count) {
            callback.call(this, true)
          } else {
            kmeans.executionIndex += 1;
            kmeans.executions[kmeans.executionIndex] = {
              iterations: kmeans.iterationIndex,
              distance: kmeans.getIterationMeanDistanceBetweenPointsAndClusters()
            };
            setTimeout(function() {
              kmeans._executeHelper(count - 1, callback);
            }, kmeans.interval);
          }
        }
      });
    }, kmeans.interval);
  },
  iterate: function(callback) {
    var kmeans = this;

    if (kmeans.reassignPointsToClusters()) {
      kmeans.iterationIndex += 1;
      callback.call(kmeans, false)
      kmeans.draw();
      kmeans.updateClustersPerAssignment();
      setTimeout(function() {
        kmeans.iterate(callback);
      }, kmeans.interval);
    } else {
      callback.call(kmeans, true)
    }
  },
  distanceBetween: function(pt1, pt2) {
    if (pt1 && pt1.x && pt1.y && pt2 && pt2.x && pt2.y) {
      return Math.sqrt(
        (Math.pow(pt2.y - pt1.y, 2)) +
        (Math.pow(pt2.x - pt1.x, 2))
      );
    } else {
      return Infinity;
    }
  },
  reassignPointsToClusters: function() {
    var changed = false,
        kmeans = this,
        curPoint, curCluster, closestCluster,
        distance, minDistance, index;

    for (index = 0; index < kmeans.clusterCount; index += 1) {
      kmeans.clusters[index] = kmeans.clusters[index] || {};
      kmeans.clusters[index].index = index;
      kmeans.clusterAssignments[index] = [];
    }

    $.each(this.points, function(pointIdx) {
      curPoint = this;
      closestCluster = kmeans.pointAssignments[pointIdx];
      minDistance = kmeans.distanceBetween(curPoint, closestCluster);

      $.each(kmeans.clusters, function(clusterIdx) {
        curCluster = this;
        closestCluster = closestCluster || this;
        distance = kmeans.distanceBetween(curPoint, curCluster);
        // If the distance is less than the current, reassign
        if (distance < minDistance) {
          changed = true;
          closestCluster = curCluster;
          minDistance = distance;
        }
      });
      kmeans.clusterAssignments[closestCluster.index].push(curPoint);
      kmeans.pointAssignments[pointIdx] = closestCluster;
    });
    return changed;
  },
  updateClustersPerAssignment: function() {
    var kmeans = this, points, sumX, sumY, ptCount;

    $.each(this.clusters, function(index) {
      points = kmeans.clusterAssignments[this.index];
      sumX = 0;
      sumY = 0;
      count = 0;
      $.each(points, function(pointIndex) {
        sumX = sumX + this.x;
        sumY = sumY + this.y;
        count = count + 1;
      });
      this.x = sumX/(count * 1.0);
      this.y = sumY/(count * 1.0);
    });
  }
};