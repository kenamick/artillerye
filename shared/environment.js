/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

function Env() {};

function createTerrainPoly(width, height) {
  var poly = []
    , amp = 1
    , amps = 0.2
    , baseY = height / 2;

  for(var i = 0; i < width + 3; i += 3) {
    var pt = [
      i,
      baseY + amp * Math.sin(1.5 * i * Math.PI / 180.0)
    ];
    poly.push(pt);

    // if (amp >= height / 4)
    //   amps = -amps;

    amp += amps;
  }

  poly.push([pt[0], height]);
  poly.push([0, height]);
  poly.push([0, baseY]);

  return poly;
};

function createHeightField(width, height) {
  var vertices = []
    , amp = 1
    , amps = 0.2
    , baseY = height / 2;

  for(var i = 0; i < width; i ++) {
    var y = baseY + amp * Math.sin(1.5 * i * Math.PI / 180.0);

    for(var j = height; j > y; j--) {
      var pt = [i, j];
      vertices.push(pt);
    }
    // if (amp >= height / 4)
    //   amps = -amps;
    amp += amps;
  }

  return vertices;
};

/**
 * Exports
 */

module.exports = {
  createTerrain: function(width, height) {
    return createHeightField(width, height);
  }
};
