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
  , packets = require('./packets');


function Player(socket, spirit, physics) {
  this.parent = this;

  this.socket = socket;
  this.spirit = spirit;
  this.physics = physics;
  this.spirits = require('./spirits')(physics);
};

Player.prototype = {

  /**
   * Callbacks
   */
  onMove: function() {},
  onShoot: function() {},

  move: function(data) {
    var x = this.physics.mpxi(this.spirit.position[0])
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
      this.physics.mpxi(this.spirit.position[0]),
      this.physics.mpxi(this.spirit.position[1]) - 8);

    // spirit.rotation = -this.spirit.rotation;
    spirit.moveForward(magnitude, data.angle);
    return spirit;
  },

  /**
   * Handle server messages
   */
  onReceivePacket: function(packet, data) {
    _globals.debug('[player] New packet --', packet, data);

   switch(packet) {

      case packets.player.MOVE:
        this.onMove(this.move(data));
      break;

      case packets.player.SHOOT:
        this.onShoot(this.shoot(data));
      break;
      /**
       * Unknown packet
       */
      default:
        _globals.debug('[player] Unknown packet', packet);
      break;
    }
  },

  setSocket: function(s) {
    this.socket = s;
  }

};

/**
 * Exports
 */

module.exports = Player;
