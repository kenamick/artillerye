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

      var touchX = input.activePointer.x
        , touchY = input.activePointer.y
        , trajectoryUpdate = false;


      if (this.trajectory) {
        // increase power value
        var dist = Phaser.Math.distance(this.trajectory.dx, this.trajectory.dy, touchX, touchY);
        if (dist < _globals.HUD_POWER_BUTTON_RADIUS) {
          this.gamefactory.updateTrajectory();
          trajectoryUpdate = true;
        }
      }

      if (game.time.now - this.lastShootAt >_globals.TOUCH_DELAY) {
        this.lastShootAt = game.time.now;

        var add = true;

        if (this.trajectory) {
          add = false;

          if (!trajectoryUpdate) {
            // fire?
            dist = Phaser.Math.distance(this.trajectory.shootx, this.trajectory.shooty,
              touchX, touchY);

            if (dist < _globals.HUD_SHOOT_BUTTON_RADIUS) {
              // notify server
              var data = {
                pid: this.id,
                angle: Physics.atan2(touchX, touchY, this.sprite.x, this.sprite.y),
                speed: this.trajectory.power
              };
              send(packets.PLAYER_SHOOT, data);

              // remove marker
              this.gamefactory.removeTrajectory();
              this.trajectory = null;
            } else {
              // player clicked elsewhere on the map
              // remove trajectory marker
              this.gamefactory.removeTrajectory();
              this.trajectory = null;
            }
          }
        }

        if (add) {
          this.trajectory = this.gamefactory.setTrajectory(this.sprite.x, this.sprite.y,
            input.activePointer.x, input.activePointer.y);
        }

      }
    } else if (input.activePointer.isUp) {
      // TODO:

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
