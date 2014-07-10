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

  this.nameFont = { font: '12px Arial', fill: '#ffffff' };
  this.txtName = this.gamefactory.game.add.text(this.sprite.x, this.sprite.y ,
    this.nametag, this.nameFont);

  this.updateName();
}

// GamePlayer.prototype.constructor = Player;
// GamePlayer.prototype = Object.create(Player.prototype);
GamePlayer.prototype = _.create(Player.prototype, {

  render: function(game) {
    this.txtName.x = this.sprite.x - this.txtName.width / 2;
    this.txtName.y = this.sprite.y - _globals.HEIGHT_PLAYER - 2;
  },

  update: function(game, send) {
    var dist
      , data
      , input = game.input;

    if (input.activePointer.isDown) {
      var touchX = input.activePointer.x
        , touchY = input.activePointer.y
        , trajectoryUpdate = false;

      /**
       * Increase shoot magnitude smoothly
       */
      if (this.trajectory) {

        dist = Phaser.Math.distance(this.trajectory.dx, this.trajectory.dy, touchX, touchY);
        if (dist < _globals.HUD_POWER_BUTTON_RADIUS) {
          this.gamefactory.updateTrajectory();
          trajectoryUpdate = true;
        }
      }
      /**
       * Timed events
       */
      if (game.time.now - this.lastShootAt >_globals.TOUCH_DELAY) {
        this.lastShootAt = game.time.now;

        // this.gamefactory.addParticleExplosion(touchX, touchY);
        var add = true;

        if (this.trajectory) {
          add = false;

          if (!trajectoryUpdate) {
            // fire?
            dist = Phaser.Math.distance(this.trajectory.shootx, this.trajectory.shooty,
              touchX, touchY);

            if (dist < _globals.HUD_SHOOT_BUTTON_RADIUS) {
              /**
               * Shoot
               */
              data = {
                a: Physics.atan2(touchX, touchY, this.sprite.x, this.sprite.y),
                s: this.trajectory.power
              };
              this.onShoot(data);

              // notify server
              send(packets.PLAYER_SHOOT, data);

              // remove marker
              this.gamefactory.removeTrajectory();
              this.trajectory = null;
            } else {
              /**
               * Movement
               */
              if (_globals.HUD_MOVE_BUTTON_RADIUS > Phaser.Math.distance(
                this.trajectory.mvfx, this.trajectory.mvfy, touchX, touchY)) {

                // move forward
                data = {d: 'f'};
                this.onMove(data);

                // notify server
                send(packets.PLAYER_MOVE, data);

              } else if (_globals.HUD_MOVE_BUTTON_RADIUS > Phaser.Math.distance(
                this.trajectory.mvbx, this.trajectory.mvby, touchX, touchY)) {

                // move backward
                data = {d: 'b'};
                this.onMove(data);

                // notify server
                send(packets.PLAYER_MOVE, data);
              }

              // Player clicked elsewhere on the map
              // or decide to move vehicle => remove trajectory marker
              this.gamefactory.removeTrajectory();
              this.trajectory = null;
            }

          } // !trajectoryUpdate
        } // this.trajectory

        if (add) {
          this.trajectory = this.gamefactory.setTrajectory(this.sprite.x, this.sprite.y,
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
  },

  onNameChange: function() {
    this.updateName();
  },

  updateName: function() {
    this.txtName.setText(this.nametag + ' (' + this.hitpoints + ')');
  },

  onDamage: function(data) {
    this.doDamage(data.d);
    this.updateName();
    if (!this.alive) {
      this.kill();
      this.sprite.kill();
      this.txtName.setText('');
    }
  },

});
Object.defineProperty(GamePlayer.prototype, 'name', {
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

module.exports = GamePlayer;
