/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var _globals = require('../../shared/globals')
  , packets = require('../../shared/packets')
  , GameFactory = require('./gameobjects.js')
  , GameClient = require('./gameclient_mock.js');

function Player(sprite) {
  this.sprite = sprite;
};

Player.prototype = {

  update: function(cursors) {
    // player input
    if (cursors.left.isDown) {
      this.sprite.spirit.rotateLeft(25);
    } else if (cursors.right.isDown) {
      this.sprite.spirit.rotateRight(25);
    } else {
      this.sprite.spirit.setZeroRotation();
    }

    if (cursors.up.isDown) {
      this.sprite.spirit.thrust(250);
    } else if (cursors.down.isDown) {
      this.sprite.spirit.reverse(10);
    }

    // limit angle movement
    var angle = this.sprite.spirit.angle;
    if (angle > Math.PI/4) {
      this.sprite.spirit.setZeroRotation();
      this.sprite.spirit.angle = Math.PI / 4;
    } else if (angle < -Math.PI/4) {
      this.sprite.spirit.setZeroRotation();
      this.sprite.spirit.angle = -Math.PI / 4;
    }
  }
};

/**
 * Exports
 */

module.exports = Player;
