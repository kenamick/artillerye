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
  , _globals = require('../../shared/globals')
  , packets = require('../../shared/packets')
  , Player = require('../../shared/player.js')
  , Physics = require('../../shared/physics')();

function GamePlayer(sprite, gamefactory) {

  Player.call(this, null, sprite.spirit, gamefactory.spirits);

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

        var touchX = input.activePointer.x
          , touchY = input.activePointer.y;

        if (this.trajectory) {
          var dist = Phaser.Math.distance(this.trajectory.dx, this.trajectory.dy,
            touchX, touchY);

          if (dist < 20) {
            // notify server
            var data = {
              pid: this.id,
              angle: Physics.atan2(touchX, touchY, this.sprite.x, this.sprite.y),
              speed: _globals.BULLET_SPEED
            };
            send(packets.PLAYER_SHOOT, data);
          }

          this.gamefactory.removeTrajectory(this.trajectory);
          this.trajectory = null;
        }

        if (!this.trajectory) {
          this.trajectory = this.gamefactory.addTrajectory(this.sprite.x, this.sprite.y,
            input.activePointer.x, input.activePointer.y);
        }

      }
    }
  },

  onMove: function (data) {
    this.move(data);
  },

  onShoot: function (data) {
    var bullet = this.shoot(data);
    this.gamefactory.addBullet(bullet);
  }

});

/**
 * Exports
 */

module.exports = GamePlayer;
