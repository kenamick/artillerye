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
  , _globals = require('./globals')
  , packets = require('./packets')
  , Physics = require('./physics')();

function Player(socket, spirit, spirits) {
  this.parent = this;

  this.socket = socket;
  this.enableAI = typeof socket === 'undefined';
  this.spirit = spirit;
  this.spirits = spirits;
  this.name = 'Unknown';
};

Player.prototype = {

  /**
   * Callbacks
   */
  onMove: function() {},
  onShoot: function() {},

  move: function(data) {
    var x = Physics.mpxi(this.spirit.position[0])
      , dx = data.target.x
      , leftMost = x - 5
      , rightMost = x + 5;

    // console.log(dx, leftMost, rightMost);
    if (dx > rightMost) {
      this.spirit.moveRight(100);
    } else if (dx < leftMost) {
      this.spirit.moveLeft(100);
    }
  },

  shoot: function(data) {
    var magnitude = Math.min(data.speed, _globals.BULLET_SPEED);

    var spirit = this.spirits.addBullet(
      Physics.mpxi(this.spirit.position[0]),
      Physics.mpxi(this.spirit.position[1]) - 8);

    // spirit.rotation = -this.spirit.rotation;
    spirit.moveForward(magnitude, data.angle);
    return spirit;
  },

  setSocket: function(s) {
    this.socket = s;
  }

};
Object.defineProperty(Player.prototype, "ai", {
  get: function () {
    return this.enableAI;
  },
  set: function (value) {
    this.enableAI = value;
  }
});
Object.defineProperty(Player.prototype, "x", {
  get: function () {
    return Physics.mpxi(this.spirit.position[0]);
  },
  set: function (value) {
    this.spirit.position[0] = Physics.pxmi(value);
  }
});
Object.defineProperty(Player.prototype, "y", {
  get: function () {
    return Physics.mpxi(this.spirit.position[1]);
  },
  set: function (value) {
    this.spirit.position[1] = Physics.pxmi(value);
  }
});

/**
 * Exports
 */

module.exports = Player;
