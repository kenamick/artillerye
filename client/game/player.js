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
};

Player.prototype = {

  update: function(input, cursors) {
    var leftMost = this.sprite.x - 5
      , rightMost = this.sprite.x + 5
      , px = input.activePointer.x;

    if (input.activePointer.isDown) {
      console.log('down');
      this.inputWasDown = true; 
    } else if (input.activePointer.isUp) {
      if (this.inputWasDown) {
        this.inputWasDown = false;
        console.log(px, leftMost, rightMost);
        if (px > rightMost)
          this.sprite.spirit.moveRight(25);
        else if (px < leftMost)
          this.sprite.spirit.moveLeft(25);
      }
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
