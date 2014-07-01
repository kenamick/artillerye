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
  , _ = require('lodash')
  , packets = require('../../shared/packets')
  , Player = require('../../shared/player.js');

function GamePlayer(sprite, physics) {

  this.sprite = sprite;

  this.inputWasDown = false;

  Player.call(this, sprite.spirit, physics);
};

_.extend(GamePlayer.prototype, Player.prototype, {

  update: function(input, cursors, gameclient) {

    if (input.activePointer.isDown) {
      this.inputWasDown = true;
    } else if (input.activePointer.isUp && this.inputWasDown) {
      this.inputWasDown = false;

      var data = {
        target: {
          x: input.activePointer.x,
          y: 0
        }
      };
      this.move(data);

      // notify server
      // gameclient.send(packets.UPDATE_PLAYER, {
      //   tag: packets.player.MOVE,
      //   data: data
      // });
    }

    // if (cursors.left.isDown) {
    //   this.sprite.spirit.reverse(1500, Math.PI);
    // } else if (cursors.right.isDown) {
    //   this.sprite.spirit.thrust(2000, Math.PI);
    // }

    // baloon player input
    // if (cursors.left.isDown) {
    //   this.sprite.spirit.rotateLeft(25);
    // } else if (cursors.right.isDown) {
    //   this.sprite.spirit.rotateRight(25);
    // } else {
    //   this.sprite.spirit.setZeroRotation();
    // }

    // if (cursors.up.isDown) {
    //   this.sprite.spirit.thrust(250);
    // } else if (cursors.down.isDown) {
    //   this.sprite.spirit.reverse(10);
    // }

    // // limit angle movement
    // var angle = this.sprite.spirit.angle;
    // if (angle > Math.PI/4) {
    //   this.sprite.spirit.setZeroRotation();
    //   this.sprite.spirit.angle = Math.PI / 4;
    // } else if (angle < -Math.PI/4) {
    //   this.sprite.spirit.setZeroRotation();
    //   this.sprite.spirit.angle = -Math.PI / 4;
    // }
  }
});

/**
 * Exports
 */

module.exports = GamePlayer;
