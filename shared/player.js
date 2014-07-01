/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var _globals = require('./globals')
  , _ = require('lodash');


function Player(spirit, physics) {
  this.parent = this;

  this.physics = physics;

  this.spirit = spirit;

};

Player.prototype = {

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

  /**
   * Handle server messages
   */
  onReceivePacket: function(packet, data) {
    _globals.debug('[player] New packet --', packet, data);

   switch(packet) {
      /**
       * Connected to server
       */
      case packets.player.MOVE:
        this.move(data);
      break;
      /**
       * Unknown packet
       */
      default:
        _globals.debug('[player] Unknown packet', packet);
      break;
    }
  }

};

/**
 * Exports
 */

module.exports = Player;
