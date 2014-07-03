/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

/**
 * Note: A lot of the functionality here is taken from Phaser's
 * Physics class. In the end, I just wanted to have the same funcs
 * running on server side.
 */

var _globals = require('./globals')
  , _ = require('lodash')
  , p2 = require('p2');

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
      // doProfiling: true,
      gravity: [this.config.gravity.x, this.config.gravity.y]
      // broadphase: new p2.SAPBroadphase()
    });

    /**
     * The error tolerance, per constraint. If the total error is below this
     * limit, the solver will stop iterating. Set to zero for as good solution
     * as possible, but to something larger than zero to make computations
     * faster.
     */
    this.world.solver.tolerance = 0.01;
    this.world.solver.iterations = 20;

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
    this.walls.top = this.addWall(x, y, -_globals.math.PI);
    return this.walls.top;
  },

  addWallBottom: function(x, y) {
    this.walls.bottom = this.addWall(x, y, 0.0);
    return this.walls.bottom;
  },

  addWallLeft: function(x, y) {
    this.walls.left = this.addWall(x, y, _globals.math.PI_2);
    return this.walls.left;
  },

  addWallRight: function(x, y) {
    this.walls.right = this.addWall(x, y, -_globals.math.PI_2);
    return this.walls.right;
  },

  addBody: function(x, y, shape, mass, angle) {
    mass = mass || 1;
    var body = new MyBody({
      mass: mass,
      position: [pxmi(x), pxmi(y)]
    });

    if (Object.prototype.toString.call(shape) === '[object Array]') {
      var fp = body.fromPolygon(shape);
    } else {
      body.addShape(shape, null, angle || 0.0);
    }

    this.world.addBody(body);
    return body;
  },

  update: function() {
    if(this.enabled) {
      // var now = Date.now() / 1000;
      // this.lastCallTime = this.lastCallTime || now;
      // var timeSinceLastCall = now - this.lastCallTime;
      // this.lastCallTime = now;
      // this.world.step(DT, timeSinceLastCall, this.maxSubSteps);
      this.world.step(DT);
    }
  },

  normalizeVertices: function(vertices) {
    for (var i = vertices.length - 1; i >= 0; i--) {
      vertices[i][0] = pxm(vertices[i][0]);
      vertices[i][1] = pxm(vertices[i][1]);
    };
    return vertices;
  },
  /**
   * Defines collision mask for all shapes in a body and sets the groups
   * this body collides with.
   * @param {[p2.Body]} body
   * @param {[Number]} mask 
   * @param {[Array]} collisionMasks
   */
  setBodyCollision: function(body, mask, collisionMasks) {
    var shapes = body.shapes;
    for (var i = shapes.length - 1; i >= 0; i--) {
      shapes[i].collisionGroup = mask;
      console.log("set collide grp ", mask);
      /**
       * Set the groups this shapes collides with
       */
      if (collisionMasks) {
        shapes[i].collisionMask = collisionMasks[collisionMasks.length - 1];
        for (var j = collisionMasks.length - 2; j >= 0; j--) {
          shapes[i].collisionMask |= collisionMasks[j];
        }
      }

    }
  },

  mpx: function(v) {
    return v *= 20;
  },

  pxm: function(v) {
    return v * 0.05;
  },

  mpxi: function(v) {
    return v *= -20;
  },

  pxmi: function(v) {
    return v * -0.05;
  },

  atan2: function(x, y, dx, dy) {
    x = pxm(x);
    y = pxm(y);
    dx = pxm(dx);
    dy = pxm(dy);
    return Math.atan2(dy - y, dx - x);
  }
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
  },

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
  /**
   * Align facing to velocity vector
   */
  alignRotationToVel: function() {
    this.angle = Math.PI + Math.atan2(this.velocity[1], this.velocity[0]);
  },
  /**
  * This will rotate the Body by the given speed to the left (counter-clockwise).
  */
  rotateLeft: function (speed) {
      this.angularVelocity = pxm(-speed);
  },
  /**
  * This will rotate the Body by the given speed to the left (clockwise).
  */
  rotateRight: function (speed) {
      this.angularVelocity = pxm(speed);
  },
  /**
  * Moves the Body forwards based on its current angle and the given speed.
  * The speed is represented in pixels per second. So a value of 100 would move 100 pixels in 1 second (1000ms).
  */
  moveForward: function (speed) {
      var magnitude = pxmi(-speed);
      var angle = this.angle + Math.PI / 2;
      this.velocity[0] = magnitude * Math.cos(angle);
      this.velocity[1] = magnitude * Math.sin(angle);
  },
  /**
  * Moves the Body backwards based on its current angle and the given speed.
  * The speed is represented in pixels per second. So a value of 100 would move 100 pixels in 1 second (1000ms).
  */
  moveBackward: function (speed) {
      var magnitude = pxmi(-speed);
      var angle = this.angle + Math.PI / 2;
      this.velocity[0] = -(magnitude * Math.cos(angle));
      this.velocity[1] = -(magnitude * Math.sin(angle));
  },
  /**
  * Applies a force to the Body that causes it to 'thrust' forwards, based on its current angle and the given speed.
  * The speed is represented in pixels per second. So a value of 100 would move 100 pixels in 1 second (1000ms).
  */
  thrust: function (speed, newAngle) {
      var magnitude = pxmi(-speed);
      var angle = typeof newAngle !== "undefined" ? newAngle : this.angle + _globals.math.PI_2;
      this.force[0] += magnitude * Math.cos(angle);
      this.force[1] += magnitude * Math.sin(angle);
  },
  /**
  * Applies a force to the Body that causes it to 'thrust' backwards (in reverse), based on its current angle and the given speed.
  * The speed is represented in pixels per second. So a value of 100 would move 100 pixels in 1 second (1000ms).
  */
  reverse: function (speed, newAngle) {
      var magnitude = pxmi(-speed);
      var angle = typeof newAngle !== "undefined" ? newAngle : this.angle + _globals.math.PI_2;
      this.force[0] -= magnitude * Math.cos(angle);
      this.force[1] -= magnitude * Math.sin(angle);
  },
  /**
  * If this Body is dynamic then this will move it to the left by setting its x velocity to the given speed.
  * The speed is represented in pixels per second. So a value of 100 would move 100 pixels in 1 second (1000ms).
  */
  moveLeft: function (speed) {
      this.velocity[0] = pxmi(-speed);
  },
  /**
  * If this Body is dynamic then this will move it to the right by setting its x velocity to the given speed.
  * The speed is represented in pixels per second. So a value of 100 would move 100 pixels in 1 second (1000ms).
  */
  moveRight: function (speed) {
      this.velocity[0] = pxmi(speed);
  },
  /**
  * If this Body is dynamic then this will move it up by setting its y velocity to the given speed.
  * The speed is represented in pixels per second. So a value of 100 would move 100 pixels in 1 second (1000ms).
  */
  moveUp: function (speed) {
      this.velocity[1] = pxmi(-speed);
  },
  /**
  * If this Body is dynamic then this will move it down by setting its y velocity to the given speed.
  * The speed is represented in pixels per second. So a value of 100 would move 100 pixels in 1 second (1000ms).
  */
  moveDown: function (speed) {
      this.velocity[1] = pxmi(speed);
  },
 // /**
 //  * Sets the force on the body to zero.
 //  */
 //  setZeroForce: function () {
 //      this.setZeroForce();
 //  },
  /**
  * If this Body is dynamic then this will zero its angular velocity.
  */
  setZeroRotation: function () {
      this.angularVelocity = 0;
  },
  /**
  * If this Body is dynamic then this will zero its velocity on both axis.
  */
  setZeroVelocity: function () {
      this.velocity[0] = 0;
      this.velocity[1] = 0;
  },
  /**
  * Sets the Body damping and angularDamping to zero.
  */
  setZeroDamping: function () {
      this.damping = 0;
      this.angularDamping = 0;
  }
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

module.exports = Physics;
