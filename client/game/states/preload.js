/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('sky01', 'assets/test_background_02.jpg');
    this.load.image('tank', 'assets/tank.png');
    this.load.image('balloon', 'assets/balloon01.png');
    this.load.image('box16', 'assets/box_16x16.png');
    this.load.image('box32', 'assets/box_32x32.png');
    this.load.image('ground64', 'assets/ground_64x64.png');
    this.load.image('water', 'assets/water.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('explosion', 'assets/explosion.png', 128, 128);

    // load client configs
    this.load.json('gameconf', 'gameconf.json', true);

  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;
