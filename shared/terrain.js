/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

function Terrain() {

};

function createTerrainPoly(width, height) {
  var poly = []
    , amp = 1
    , amps = 0.2
    , baseY = height / 2;

  for(var i = 0; i < width + 3; i+=3) {
    var pt = [
      i,
      baseY + amp * Math.sin(1.2*i * Math.PI / 180.0)
    ];
    poly.push(pt);

    if (amp >= height / 2)
      amps = -amps;

    amp += amps;
  }

  poly.push([pt[0], height]);
  poly.push([0, height]);
  poly.push([0, baseY]);

  return poly;
};

module.exports = {
  create: function(width, height) {
    return createTerrainPoly(width, height);
  }
};
