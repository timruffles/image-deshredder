var attrs, byId, css, doc, images, lastJoined, scaleImage;
var __hasProp = Object.prototype.hasOwnProperty;
doc = document;
Element.prototype.on = Element.prototype.addEventListener;
doc.on = doc.addEventListener;
byId = function(id) {
  return doc.getElementById(id);
};
attrs = function(el, attrs) {
  var key, val, _results;
  _results = [];
  for (key in attrs) {
    if (!__hasProp.call(attrs, key)) continue;
    val = attrs[key];
    _results.push(el.setAttribute(key, val));
  }
  return _results;
};
css = function(el, attrs) {
  var key, rules, val;
  rules = (function() {
    var _results;
    _results = [];
    for (key in attrs) {
      if (!__hasProp.call(attrs, key)) continue;
      val = attrs[key];
      _results.push("" + key + ":" + val + ";");
    }
    return _results;
  })();
  return el.setAttribute("style", (el.getAttribute("style") || "") + rules.join(""));
};
scaleImage = function(canvas, maxWidth, maxHeight, image, context) {
  var minRatio;
  minRatio = Math.min(maxWidth / image.width, maxHeight / image.height);
  attrs(canvas, {
    width: image.width * minRatio,
    height: image.height * minRatio
  });
  if (minRatio < 1) {
    return context.scale(minRatio, minRatio);
  }
};
images = {};
lastJoined = null;
doc.on("DOMContentLoaded", function() {
  var fg, joinImage, maxHeight, maxWidth, pols, shred;
  pols = byId("polaroids");
  shred = byId("shredder");
  fg = byId("fg");
  maxWidth = 200;
  maxHeight = 200;
  ["shredded-one.jpg", "shredded-three.jpg", "tokyo.png"].forEach(function(img) {
    var image;
    image = images[img] = new Image();
    image.src = "img/" + img;
    return image.onload = function() {
      var back, pol, two;
      pol = doc.createElement("canvas");
      two = pol.getContext("2d");
      back = doc.createElement("div");
      attrs(back, {
        "class": "polaroid",
        draggable: true
      });
      css(back, {
        width: maxWidth + "px",
        height: maxHeight + "px"
      });
      scaleImage(pol, maxWidth, maxHeight, image, two);
      two.drawImage(image, 0, 0);
      back.appendChild(pol);
      back.on("dragstart", function(e) {
        return e.dataTransfer.setData("text/plain", img);
      });
      return pols.appendChild(back);
    };
  });
  shred.on("dragover", function(e) {
    return e.preventDefault();
  });
  joinImage = function(img) {
    var csv, ctx, data, joined, joinedCtx, offset, part, polaroid, sourceImage, target, targetCtx, width, _len, _ref;
    csv = doc.createElement("canvas");
    attrs(csv, {
      width: img.width,
      height: img.height
    });
    ctx = csv.getContext("2d");
    polaroid = doc.createElement("div");
    attrs(polaroid, {
      "class": "polaroid joined"
    });
    css(polaroid, {
      width: "400px",
      height: "400px"
    });
    joined = doc.createElement("canvas");
    attrs(joined, {
      width: img.width,
      height: img.height
    });
    joinedCtx = joined.getContext("2d");
    ctx.drawImage(img, 0, 0);
    data = ctx.getImageData(0, 0, img.width, img.height);
    _ref = deshred(data);
    for (offset = 0, _len = _ref.length; offset < _len; offset++) {
      part = _ref[offset];
      width = part[1] - part[0] + 1;
      sourceImage = ctx.getImageData(part[0], 0, width, img.height);
      joinedCtx.putImageData(sourceImage, offset * width, 0);
    }
    target = doc.createElement("canvas");
    targetCtx = target.getContext("2d");
    scaleImage(target, 400, 400, img, targetCtx);
    targetCtx.drawImage(joined, 0, 0);
    polaroid.appendChild(target);
    shred.appendChild(polaroid);
    polaroid.onclick = function() {
      return polaroid.parentNode.removeChild(polaroid);
    };
    setTimeout(function() {
      return polaroid.setAttribute("class", "polaroid joined animate");
    }, 25);
    return lastJoined = polaroid;
  };
  return shred.on("drop", function(e) {
    var file, reader, _ref;
    if (lastJoined) {
      if ((_ref = lastJoined.parentNode) != null) {
        _ref.removeChild(lastJoined);
      }
    }
    console.log("heard drop");
    fg.setAttribute("class", "fg on");
    if (e.dataTransfer.files.length > 0) {
      file = e.dataTransfer.files[0];
      reader = new FileReader;
      reader.onload = function(file) {
        var img;
        img = new Image;
        img.src = file.target.result;
        return img.onload = function() {
          joinImage(img);
          return setTimeout(function() {
            return fg.setAttribute("class", "fg");
          }, 1500);
        };
      };
      return reader.readAsDataURL(file);
    } else {
      joinImage(images[e.dataTransfer.getData("text/plain")]);
      return setTimeout(function() {
        return fg.setAttribute("class", "fg");
      }, 1500);
    }
  });
});