/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var p2 = require('p2');

/**
 * The fixed time step size to use.
 */
var DT = 1.0 / 60.0;

function mpx(v) {
  return v *= 20;
};

function pxm(v) {
  return v * 0.05;
};

function mpxi(v) {
  return v *= -20;
};

function pxmi(v) {
  return v * -0.05;
};

function Physics(config) {
  this.config = config || {};

  this.enabled = true;
  this.lastCallTime = null;
  this.maxSubSteps = 3;

  this.walls = {};

  this.init();

  this.shapes = new Shapes(this);
};

Physics.prototype = {

  init: function() {
    this.config.gravity = this.config.gravity || {x: 0, y: 0};
    this.config.gravity.x = pxm(-this.config.gravity.x);
    this.config.gravity.y = pxm(-this.config.gravity.y);
    console.log(this.config.gravity);
    this.world = new p2.World({
    //   // doProfiling: true,
      gravity: [this.config.gravity.x, this.config.gravity.y],
      broadphase: new p2.SAPBroadphase()
    });
    // this.world.gravity[0] = this.config.gravity.x;
    // this.world.gravity[1] = this.config.gravity.y;

    if (this.config.restitution)
      this.world.defaultContactMaterial.restitution = this.config.restitution;

  },

  addWall: function(x, y, angle) {
    var planeShape = new p2.Plane()
      , plane = new p2.Body({
          position: [pxm(x), pxm(y)],
          mass: 0,
          angle: angle
        });

    plane.addShape(planeShape);
    this.world.addBody(plane);
    return plane;
  },

  addWallTop: function(x, y) {
    this.walls.top = this.addWall(x, y, -3.14159265358979);
    return this.walls.top;
  },

  addWallBottom: function(x, y) {
    this.walls.bottom = this.addWall(x, y, 0.0);
    return this.walls.bottom;
  },

  addWallLeft: function(x, y) {
    this.walls.left = this.addWall(x, y, 1.5707963267948966);
    return this.walls.left;
  },

  addWallRight: function(x, y) {
    this.walls.right = this.addWall(x, y, -1.5707963267948966);
    return this.walls.right;
  },

  addBody: function(x, y, shape, mass) {
    mass = mass || 1;
    var body = new p2.Body({
      mass: mass,
      position: [pxm(x), pxm(y)]
    });
    body.addShape(shape, null, Math.PI/2);
    this.world.addBody(body);
    return body;
  },

  update: function() {
    if(this.enabled) {
      var now = Date.now() / 1000;
      this.lastCallTime = this.lastCallTime || now;
      var timeSinceLastCall = now - this.lastCallTime;
      this.lastCallTime = now;
      this.world.step(DT, timeSinceLastCall, this.maxSubSteps);
      // this.world.step(DT);
    }
  },
};

Object.defineProperty(Physics.prototype, "paused", {
  get: function () {
    return this.enabled;
  },
  set: function (value) {
    this.enabled = !value;
  }
});

/**
 * Create/Load new shapes
 */
function Shapes(physics) {
  this.p = physics;
};

Shapes.prototype = {

  rect: function(w, h) {
    return new p2.Rectangle(pxm(w), pxm(h));
  }

};

/**
 * Exports
 */

module.exports = function(config) {
  return new Physics(config);
};
