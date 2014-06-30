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

  this.inputWasDown = false;

  this.destination = {move: false, target: {}};
};

Player.prototype = {

  update: function(input, cursors) {

    if (input.activePointer.isDown) {
      this.inputWasDown = true;
    } else if (input.activePointer.isUp) {
      if (this.inputWasDown) {
        this.inputWasDown = false;

        this.destination.move = true;
        this.destination.target.x = input.activePointer.x;
        // this.dest = Phaser.Math.distance(px, this.sprite.y, this.sprite.x, this.sprite.y)
      }
    }

    if (this.destination.move) {
      var leftMost = this.sprite.x - 5
        , rightMost = this.sprite.x + 5;

      if (this.destination.target.x > rightMost)
        this.sprite.spirit.moveRight(100);
      else if (this.destination.target.x < leftMost)
        this.sprite.spirit.moveLeft(100);

      this.destination.move = false;
    }

    if (cursors.left.isDown) {
      this.sprite.spirit.reverse(1500, Math.PI);
    } else if (cursors.right.isDown) {
      this.sprite.spirit.thrust(2000, Math.PI);
    }

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
};

/**
 * Exports
 */

module.exports = Player;
