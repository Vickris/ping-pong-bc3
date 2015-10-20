//Function.prototype.bind ensure that instance methods used as callbacks (e.g. event handlers) have the correct this set
if (!Function.prototype.bind) {
  Function.prototype.bind = function(obj) {
    var slice = [].slice,
        args  = slice.call(arguments, 1),
        self  = this,
        nop   = function () {},
        bound = function () {
          return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));   
        };
    nop.prototype   = self.prototype;
    bound.prototype = new nop();
    return bound;
  };
}

//create object but one cannot pass in arguments
if (!Object.create) {
  Object.create = function(base) {
    function F() {};
    F.prototype = base;
    return new F();
  }
}

//construct allows us to pass in arguments
if (!Object.construct) {
  Object.construct = function(base) {
    var instance = Object.create(base);
    if (instance.initialize)
      instance.initialize.apply(instance, [].slice.call(arguments, 1));
    return instance;
  }
}

//copy object properties to another object, mostly in jquery but not a standard
if (!Object.extend) {
  Object.extend = function(destination, source) {
    for (var property in source) {
      if (source.hasOwnProperty(property))
        destination[property] = source[property];
    }
    return destination;
  };
}

loadImages: function(sources, callback) { /* load multiple images and callback when ALL have finished loading */
  var images = {};
  var count = sources ? sources.length : 0;
  if (count == 0) {
    callback(images);
  }
  else {
    for(var n = 0 ; n < sources.length ; n++) {
      var source = sources[n];
      var image = document.createElement('img');
      images[source] = image;
      Game.addEvent(image, 'load', function() { if (--count == 0) callback(images); });
      image.src = source;
    }
  }
}, 