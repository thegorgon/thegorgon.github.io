var distanceBetween = (a, b) => {
  return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
};

var sortByDistance = (point, array) => {
  return array.slice(0).sort((a, b) => {
    var distA = distanceBetween(a, point);
    var distB = distanceBetween(b, point);
    if (distA < distB) { return -1; }
    else if (distA > distB) { return 1; }
    else { return 0; }
  });
};

var heading = (start, end) => {
  return Math.atan2(end.y - start.y, end.x - start.x);
};

var towards = (start, end, distance) => {
  var theta = heading(start, end);
  return {
    x: start.x + distance * Math.cos(theta),
    y: start.y + distance * Math.sin(theta)
  };
};

var awayFrom = (start, end, distance) => {
  var theta = heading(start, end) + Math.PI;
  return {
    x: start.x + distance * Math.cos(theta),
    y: start.y + distance * Math.sin(theta)
  };
};

var Geometry = {
  distanceBetween: distanceBetween,
  sortByDistance: sortByDistance,
  kNearest: (point, array, k) => {
    return sortByDistance(point, array).slice(0, k);
  },
  nearest: (point, array) => {
    return sortByDistance(point, array)[0];
  },
  within: (point, array, distance) => {
    return array.filter((other) => {
      return distanceBetween(point, other) <= distance;
    });
  },
  between: (point, array, minDistance, maxDistance) => {
    var distance;
    return array.filter((other) => {
      distance = distanceBetween(point, other);
      return distance <= maxDistance && distance >= minDistance;
    });
  },
  withinAngle: (point, array, angle) => {
    return array.filter((other) => {
      return Math.abs(heading(point, other)) <= point.heading + angle;
    });
  },
  forward: (point, distance) => {
    return {
      x: point.x + distance * Math.cos(point.heading),
      y: point.y + distance * Math.sin(point.heading),
      heading: point.heading
    }
  },
  centroid: (points) => {
    return points.reduce((acc, point) => {
      return {
        x: acc.x + point.x / (1.0 * points.length),
        y: acc.y + point.y / (1.0 * points.length)
      }
    }, { x: 0.0, y: 0.0 });
  },
  random: (x, y, heading) => {
    return {
      x: Math.random() * x - x * 0.5,
      y: Math.random() * y - y * 0.5,
      heading: Math.random() * heading - heading * 0.5
    };
  },
  add: (p1, p2) => {
    return {
      x: p1.x + p2.x,
      y: p1.y + p2.y,
      heading: p1. heading + p2.heading
    }
  },
  averageHeading: (array) => {
    return array.reduce((acc, point) => {
      return acc + point.heading/(1.0 * array.length);
    }, 0);
  },
  heading: heading,
  towards: towards,
  awayFrom: awayFrom,
  maintainDistanceBetween: (start, end, distance) => {
    var actualDist = distanceBetween(start, end);
    if (actualDist > distance) {
      return towards(start, end, distance - actualDist);
    } else if (actualDist < distance) {
      return awayFrom(start, end, actualDist - distance);
    } else {
      return start;
    }
  }
}

module.exports = Geometry;
