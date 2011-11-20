var MIN_SLICES, MIN_SLICE_SIZE, Rect, abs, bottomQuartile, ceil, deshred, distance, getDistance, max, mergeRect, min, pixelAt, random, round, takeMax, takeMin, total;
MIN_SLICE_SIZE = 8;
MIN_SLICES = 12;
random = Math.random, round = Math.round, min = Math.min, max = Math.max, ceil = Math.ceil, abs = Math.abs;
distance = function(pixelA, pixelB) {
  return pixelA.reduce(function(sum, val, index) {
    return sum + abs(val - pixelB[index]);
  }, 0);
};
mergeRect = function(_arg) {
  var components, rectA, rectB;
  rectA = _arg[0], rectB = _arg[1];
  components = (rectA.components || [rectA]).concat(rectB.components || [rectB]);
  return new Rect(rectA[0], rectB[1], components);
};
takeMax = function(arr, highest, highestAt) {
  var index, memeber, val, _len, _ref;
  if (highest == null) {
    highest = -Infinity;
  }
  if (highestAt == null) {
    highestAt = -1;
  }
  for (index = 0, _len = arr.length; index < _len; index++) {
    _ref = arr[index], memeber = _ref[0], val = _ref[1];
    if (val > highest) {
      highest = val;
      highestAt = index;
    }
  }
  return arr[highestAt];
};
takeMin = function(arr, lowest, lowestAt) {
  var index, memeber, val, _len, _ref;
  if (lowest == null) {
    lowest = Infinity;
  }
  if (lowestAt == null) {
    lowestAt = -1;
  }
  for (index = 0, _len = arr.length; index < _len; index++) {
    _ref = arr[index], memeber = _ref[0], val = _ref[1];
    if (val < lowest) {
      lowest = val;
      lowestAt = index;
    }
  }
  return arr[lowestAt];
};
pixelAt = function(x, y, image) {
  var base, offset, _results;
  base = (x * 4) + y * (image.width * 4);
  _results = [];
  for (offset = 0; offset <= 2; offset++) {
    _results.push(image.data[base + offset]);
  }
  return _results;
};
total = function(samples) {
  return samples.sum();
};
bottomQuartile = function(samples) {
  return samples.bottomQuartile().sum();
};
getDistance = function(offsetA, offsetB, image, fn) {
  var samples, y;
  if (fn == null) {
    fn = total;
  }
  samples = (function() {
    var _ref, _results;
    _results = [];
    for (y = 0, _ref = image.height - 2; 0 <= _ref ? y <= _ref : y >= _ref; 0 <= _ref ? y++ : y--) {
      _results.push(distance(pixelAt(offsetA, y, image), pixelAt(offsetB, y, image)));
    }
    return _results;
  })();
  return fn(samples);
};
Array.prototype.sum = function() {
  return this.reduce(function(sum, v) {
    return sum + v;
  });
};
Array.prototype.bottomQuartile = function() {
  return this.slice(0).sort(function(a, b) {
    return (a === b && 0) || (a > b && 1) || -1;
  }).slice(0, round(this.length / 4));
};
Rect = function(left, right, components) {
  this.components = components;
  this[0] = left;
  return this[1] = right;
};
Rect.prototype = new Array();
deshred = function(image) {
  var current, distancesForMultiple, height, integerMultiples, multiple, offset, pairMinimal, slices, width, _, _ref;
  height = image.height, width = image.width;
  integerMultiples = (function() {
    var _ref, _results;
    _results = [];
    for (multiple = MIN_SLICE_SIZE, _ref = round(width / MIN_SLICES); MIN_SLICE_SIZE <= _ref ? multiple <= _ref : multiple >= _ref; MIN_SLICE_SIZE <= _ref ? multiple++ : multiple--) {
      distancesForMultiple = (function() {
        var _ref2, _results2;
        _results2 = [];
        for (offset = 1, _ref2 = ceil(width / multiple); 1 <= _ref2 ? offset <= _ref2 : offset >= _ref2; 1 <= _ref2 ? offset++ : offset--) {
          if (offset * multiple < width) {
            _results2.push(getDistance(offset * multiple - 1, offset * multiple, image));
          }
        }
        return _results2;
      })();
      _results.push([multiple, distancesForMultiple.sum() / distancesForMultiple.length]);
    }
    return _results;
  })();
  _ref = takeMax(integerMultiples), offset = _ref[0], _ = _ref[1];
  console.log("largest differences at " + offset);
  slices = (function() {
    var _ref2, _results, _step;
    _results = [];
    for (current = 0, _ref2 = width - 1, _step = offset; 0 <= _ref2 ? current <= _ref2 : current >= _ref2; current += _step) {
      _results.push([current, min(current + offset - 1, width - 1)]);
    }
    return _results;
  })();
  pairMinimal = function(slice) {
    var leftDistances, lmin, partner, right, rightDistances, rmin, sliceB, _ref2, _ref3;
    if (slice == null) {
      slice = slices.pop();
    }
    if (slices.length === 0) {
      return slice;
    }
    rightDistances = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = slices.length; _i < _len; _i++) {
        sliceB = slices[_i];
        _results.push([sliceB, getDistance(slice[1], sliceB[0], image, bottomQuartile)]);
      }
      return _results;
    })();
    leftDistances = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = slices.length; _i < _len; _i++) {
        sliceB = slices[_i];
        _results.push([sliceB, getDistance(sliceB[1], slice[0], image, bottomQuartile)]);
      }
      return _results;
    })();
    _ref2 = [takeMin(rightDistances), takeMin(leftDistances)], rmin = _ref2[0], lmin = _ref2[1];
    right = rmin[1] < lmin[1];
    _ref3 = right ? rmin : lmin, partner = _ref3[0], _ = _ref3[1];
    slices.splice(slices.indexOf(partner), 1);
    return pairMinimal(mergeRect(right ? [slice, partner] : [partner, slice]));
  };
  return pairMinimal().components;
};