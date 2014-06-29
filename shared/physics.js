/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var p2 = require('p2')
  , _ = require('lodash');

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

/**
 * Main physics object responsible for
 * initializations and objects creation
 */
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
          position: [pxmi(x), pxmi(y)],
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
    var body = new MyBody({
      mass: mass,
      position: [pxmi(x), pxmi(y)]
    });
    console.log(body);
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
      // this.world.step(game.time.physicsElapsed);
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
  // this.physics = physics;
};

Shapes.prototype = {

  rect: function(w, h) {
    return new p2.Rectangle(pxm(w), pxm(h));
  }

};

/**
 * [Body description]
 * @param {[type]} physics [description]
 */
function MyBody() {
  p2.Body.apply(this, arguments);
  // this.physics = physics;
};

_.extend(MyBody.prototype, p2.Body.prototype, {


});
Object.defineProperty(MyBody.prototype, "x", {
  get: function () { return mpxi(this.position[0]); },
  set: function (value) { this.position[0] = pxmi(value); }
});
Object.defineProperty(MyBody.prototype, "y", {
  get: function () { return mpxi(this.position[1]); },
  set: function (value) { this.position[1] = pxmi(value); }
});

/**
 * Exports
 */

module.exports = function(config) {
  return new Physics(config);
};
