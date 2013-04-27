window.Gorgon = window.Gorgon || {};
window.Gorgon.Kmeans = function(points, initialClusters) {
  this.points = points;
  this.clusters = initialClusters;
  this.clusterAssignments = new Array(this.clusters.length);
};
window.Gorgon.Kmeans.prototype = {
  execute: function(callback, index) {
    if (typeof(index) != "number") { index = 0 };

    if (this._assignClusters()) {
      callback.call(this, index, false);
      this._updateClusters();
      this.execute(callback, index + 1);
    } else {
      callback.call(this, index, true);
    }
  },
  _assignClusters: function() {
    var changed = false,
        point, cluster, closestCluster,
        distance, minDistance, i, j;

    for (i = 0; i < this.clusters.length; i += 1) {
      kmeans.clusters[i] = kmeans.clusters[i] || {};
      kmeans.clusters[i].index = i;
      kmeans.clusterAssignments[i] = [];
    }

    for (i = 0; i < this.points.length; i += 1) {
      point = this.points[i];
      closestCluster = kmeans.pointAssignments[pointIdx];
      minDistance = kmeans.distanceBetween(point, closestCluster);
      for (j = 0; j < this.clusters.length; j += 1) {
        cluster = this.clusters[j];
        closestCluster = closestCluster || cluster;
        distance = kmeans.distanceBetween(point, cluster);
        // If the distance is less than the current, reassign
        if (distance < minDistance) {
          changed = true;
          closestCluster = cluster;
          minDistance = distance;
        }
      }
      this.clusterAssignments[closestCluster.index].push(point);
      this.pointAssignments[pointIdx] = closestCluster;
    }
    return changed;
  },
  _updateClusters: function() {
    var kmeans = this, center;

    $.each(kmeans.clusters, function(index) {
      center = kmeans._centerPoint(kmeans.clusterAssignments[this.index]);
      this.x = center.x;
      this.y = center.y;
    });
  },
  _distanceBetween: function(pt1, pt2) {
    if (pt1 && pt1.x && pt1.y && pt2 && pt2.x && pt2.y) {
      return Math.sqrt(
        (Math.pow(pt2.y - pt1.y, 2)) +
        (Math.pow(pt2.x - pt1.x, 2))
      );
    } else {
      return Infinity;
    }
  },
  _centerPoint: function(points) {
    var sumX = 0;
    var sumY = 0;
    var count = 0;
    $.each(points, function(i) {
      sumX = sumX + this.x;
      sumY = sumY + this.y;
      count = count + 1;
    });
    return {
      x: sumX/(count * 1.0),
      y: sumY/(count * 1.0)
    }
  }
};


window.Gorgon.KmeansSimulator = function(canvas) {
  this.canvas = canvas;
  this.interval = 100;
  this.pointCount = 0;
  this.clusterCount = 0;
  this.generatedClusterCount = 0;
};
window.Gorgon.Kmeans.prototype = {
  drawClusterCenter: function(center) {
    this.canvas.drawPoint(center.x, center.y, 5, "#ff0000");
  },
  drawDataPoint: function(data) {
    this.canvas.drawPoint(data.x, data.y, 2, "#0000ff");
  },
  drawCenterPoint: function(data) {
    this.canvas.drawPoint(data.x, data.y, 3, "#000000");
  },
  drawAssociation: function(data, center) {
    this.canvas.drawLine(data.x, data.y, center.x, center.y, "#00ff00");
  },
  setClusterCount: function(k) {
    this.clusterCount = parseInt(k, 10);
  },
  setPointCount: function(n) {
    this.pointCount = parseInt(n, 10);
    this.generatedClusterCount = Math.round(this.pointCount * 0.01);
  },
  setClusterGeneration: function(generation) {
    this.generation = generation;
  },
  setIterationInterval: function(interval) {
    this.interval = interval;
  },
  randomizePoints: function() {
    this.resetAssignments();
    this.points = new Array(this.pointCount);
    this.centers = new Array(this.generatedClusterCount);
    var width = this.canvas.getWidth();
    var height = this.canvas.getHeight();
    var i, center;

    for (i = 0; i < this.centers.length; i += 1) {
      this.centers[i] = this._randomPoint(50, 50, width - 50, height - 50);
    }

    for (i = 0; i < this.pointCount; i += 1) {
      center = this.centers[Math.floor(Math.random() * this.centers.length)];
      this.points[i] = this._randomPoint(center.x - 50, center.y - 50,
                                         center.x + 50, center.y + 50);
    }
  },
  _randomPoint: function(minX, minY, maxX, maxY) {
    var randX = Math.random();
    var randY = Math.random();
    var x = Math.floor((randX * (maxX - minX)) + minX);
    var y = Math.floor((randY * (maxY - minY)) + minY);
    return {x: x, y: y};
  },

  draw: function() {
    var kmeans = this, clusterCenter;
    kmeans.canvas.clear();
    if (kmeans.points) {
      $.each(kmeans.points, function(pointIdx) {
        kmeans.drawDataPoint(this);

        if (kmeans.pointAssignments) {
          clusterCenter = kmeans.pointAssignments[pointIdx];
          if (clusterCenter) {
            kmeans.drawAssociation(this, clusterCenter);
          }
        }
      });
    }
    if (kmeans.clusters) {
      $.each(kmeans.clusters, function(clusterIdx) {
        kmeans.drawClusterCenter(this);
      });
    }
    // if (kmeans.centers) {
    //   $.each(kmeans.centers, function(centerIdx) {
    //     kmeans.drawCenterPoint(this);
    //     kmeans.canvas.drawSquare(this, 100, '#000000');
    //   });
    // }
  },
  getExecutionIndex: function() {
    return this.executionIndex;
  },
  execute: function(callback) {
    if (!this.points) {
      this.randomizePoints();
    }
    this.resetAssignments();
    this.executions = new Array(count);
    this._executeHelper(count, callback)
  },
  resetAssignments: function() {
    this.executionIndex = 0;
    this.pointAssignments = new Array(this.pointCount);
    this.clusters = new Array(this.clusterCount);
    this.clusterAssignments = new Array(this.clusterCount);
    var kmeans = this;

    kmeans.iterationIndex = 0;
    kmeans.randomizeClusters();
    kmeans.draw();
    kmeans.iterate(function(completed) {
      callback.call(this, completed);

      if (completed) {
        console.log(count);
        if (count <= 1) {
          callback.call(this, true)
        } else {
          kmeans.executionIndex += 1
          kmeans.executions[kmeans.executionIndex] = {
            iterations: kmeans.iterationIndex,
            distance: kmeans.getIterationMeanDistanceBetweenPointsAndClusters(),
            clusters: kmeans.clusters.slice()
          };
          setTimeout(function() {
            kmeans._executeHelper(count - 1, callback);
          }, kmeans.interval);
        }
      }
    });
  }
};