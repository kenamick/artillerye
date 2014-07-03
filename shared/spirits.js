/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var _ = require('lodash')
  , _globals = require('./globals');

var masks = {
  DEFAULT: 1,
  WALL: 2,
  GROUND: 4,
  BLOCK: 8,
  PLAYER: 16,
  BULLET: 32,
};

function getAllMasks(skipId) {
  var result = [];
  for (var i in masks) {
    if (skipId !== masks[i])
      result.push(masks[i]);
  }
  return result;
};

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

module.exports = function(physics) {
  return {

    addWalls: function(width, height) {
      physics.setBodyCollision(
        physics.addWallTop(0, 0), masks.WALL, getAllMasks(masks.WALL));
      physics.setBodyCollision(
        physics.addWallBottom(0, height), masks.WALL, getAllMasks(masks.WALL));
      physics.setBodyCollision(
        physics.addWallLeft(0, 0), masks.WALL,getAllMasks(masks.WALL));
      physics.setBodyCollision(
        physics.addWallRight(width, 0), masks.WALL, getAllMasks(masks.WALL));
    },

    addGround: function(width, height) {
      var blocks = []
        , size = _globals.WIDTH_GROUND
        , amount = width / size
        , y = height / size - 1;

      for (var i = amount - 1; i >= 0; i--) {
        var shape = physics.shapes.rect(size, size);
        var spirit = physics.addBody(i * size, y * size, shape, 
          _globals.WEIGHT_GROUND);

        // spirit.mass = 0;
        spirit.fixedRotation = true;
        physics.setBodyCollision(spirit, masks.GROUND, getAllMasks());

        blocks.push(spirit);
      }
      
      return blocks;
    },

    addPlayer: function(x, y, w, h) {
      w = physics.pxm(w);
      h = physics.pxm(h);
      var wt = w / 25
        , hh = h / 2
        , ccw = [
        /**
         * Create a convex for the tank body
         * /-----\
         * \-----/
         */
        [wt, 0], [0, hh], [wt, h], [w - wt, h], [w, hh], [w - wt, 0]
      ];
      // var shape = physics.shapes.convex(w, h);
      var spirit = physics.addBody(x, y, ccw, _globals.WEIGHT_PLAYER, 0.0); //-Math.PI / 2);
      spirit.fixedRotation = true;
      physics.setBodyCollision(spirit, masks.PLAYER, getAllMasks());

      return spirit;
    },

    addBlocks: function(width, height) {
      var vertices = createHeightField(width, height)
        , size = _globas.WIDTH_BLOCK
        , blocks = [];

      for (var i = vertices.length - 1; i >= 0; i--) {
        var shape = physics.shapes.rect(size, size);
        var spirit = physics.addBody(
          vertices[i][0] * size, vertices[i][1] * size, 
          shape, _globals.WEIGHT_BLOCK);

        physics.setBodyCollision(spirit, masks.BLOCK, getAllMasks());
        blocks.push(spirit);
      }

      return blocks;
    },

    addBullet: function(x, y) {
      var shape = physics.shapes.rect(
        _globals.WIDTH_BULLET, _globals.HEIGHT_BULLET);

      var spirit = physics.addBody(x, y, shape, _globals.WEIGHT_BULLET);
      physics.setBodyCollision(spirit, masks.BULLET, getAllMasks(masks.BULLET));

      return spirit;
    }

  };
};
