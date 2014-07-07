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
  this.spirit = spirit;
  this.spirits = spirits;

  this.enableAI = typeof socket === 'undefined';

  this.nametag = 'Unknown';

  this.alive = true;
};

Player.prototype = {

  /**
   * Callbacks
   */
  onMove: function() {},
  onShoot: function() {},
  onNameChange: function() {},

  move: function(data) {
    if (data.d === 'f') {
      this.spirit.moveRight(50);
    } else if (data.d === 'b') {
      this.spirit.moveLeft(50);
    }
    // var x = Physics.mpxi(this.spirit.position[0])
    //   , dx = data.target.x
    //   , leftMost = x - 5
    //   , rightMost = x + 5;

    // // console.log(dx, leftMost, rightMost);
    // if (dx > rightMost) {
    //   this.spirit.moveRight(100);
    // } else if (dx < leftMost) {
    //   this.spirit.moveLeft(100);
    // }
  },

  shoot: function(data) {
    var magnitude = Math.min(data.speed, _globals.MAX_BULLET_SPEED);

    var spirit = this.spirits.addBullet(
      Physics.mpxi(this.spirit.position[0]),
      Physics.mpxi(this.spirit.position[1]) - 8);

    // spirit.rotation = -this.spirit.rotation;
    spirit.moveForward(magnitude, data.angle);
    return spirit;
  },

  setSocket: function(s) {
    this.socket = s;
  },

  getSocketId: function() {
    if (this.socket)
      return this.socket.id;
  },

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
    // this.onUpdatePosition(value, null);
  }
});
Object.defineProperty(Player.prototype, "y", {
  get: function () {
    return Physics.mpxi(this.spirit.position[1]);
  },
  set: function (value) {
    this.spirit.position[1] = Physics.pxmi(value);
    // this.onUpdatePosition(null, value);
  }
});
Object.defineProperty(Player.prototype, "name", {
  get: function () {
    return this.nametag;
  },
  set: function (value) {
    this.nametag = value;
    this.nametag = this.nametag.substring(0, _globals.MAX_NAME_SIZE);
    this.onNameChange();
  }
});

/**
 * Exports
 */

module.exports = Player;
