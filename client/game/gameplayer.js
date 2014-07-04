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

function GamePlayer(sprite, gamefactory) {

  Player.call(this, null, sprite.spirit, gamefactory.physics);

  this.sprite = sprite;
  this.gamefactory = gamefactory;
  this.inputWasDown = false;
  this.lastShootAt = 0;

};

_.extend(GamePlayer.prototype, Player.prototype, {

  update: function(game, send) {
    var input = game.input;

    // Movement

    // if (input.activePointer.isDown) {
    //   this.inputWasDown = true;
    // } else if (input.activePointer.isUp && this.inputWasDown) {
    //   this.inputWasDown = false;

    //   var data = {
    //     target: {
    //       x: input.activePointer.x,
    //       y: 0
    //     }
    //   };
    //   this.move(data);

    //   notify server
    //   gameclient.send(packets.UPDATE_PLAYER, {
    //     tag: packets.player.MOVE,
    //     data: data
    //   });
    // }

    // Shoot

    if (input.activePointer.isDown) {
      if (game.time.now - this.lastShootAt >_globals.PLAYER_SHOOT_DELAY) {
        this.lastShootAt = game.time.now;

        var angle = this.gamefactory.physics.atan2(
          input.activePointer.x, input.activePointer.y,
          this.sprite.x, this.sprite.y);

        console.log(angle);

        var data = {
          angle: angle,
          speed: _globals.BULLET_SPEED
        };

        // notify server
        send(packets.UPDATE_PLAYER, {
          tag: packets.player.SHOOT,
          data: data
        });
      }
    }
  },

  onShoot: function(spirit) {
    this.gamefactory.addBullet(spirit);
  }

});

/**
 * Exports
 */

module.exports = GamePlayer;
