/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

function Play() {}

Play.prototype = {

  create: function() {

    var Terrain = require('../../../shared/terrain');

    var gw = this.game.width;
    var gh = this.game.height;

    // fps
    this.game.time.advancedTiming = true;
    this.fpsText = this.game.add.text(
      20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    );

    // enable P2 physics
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.p2.restitution = 0.09;
    this.game.physics.p2.gravity.y = 500;

    // add backdrop
    this.backdrop = this.game.add.sprite(0, 0, 'sky01');

    // add terrain
    var vertices = Terrain.create(30, 10);
    this.voxels = this.createTerrain(vertices, 32);

    // add game tank sprite
    this.player1 = this.createPlayer(150, 50);
    this.player2 = this.createPlayer(350, 50);
    this.player3 = this.createPlayer(550, 50);
    this.player4 = this.createPlayer(750, 50);

    this.game.input.onDown.add(this.click, this);

  },

  update: function() {
    if (this.game.time.fps !== 0) {
      this.fpsText.setText(this.game.time.fps + ' FPS');
    }
  },

  click: function(pointer) {
    // var bodies = this.game.physics.p2.hitTest(pointer.position, [ this.terrain ]);
    // if (bodies.length > 0) {
    //   var dx = this.game.input.x - this.terrain.x;
    //   var dy = this.game.input.y - this.terrain.y;

    //   console.log('opaa ', dx, dy);

    //   var ctx = this.terrainBM.context;
    //   ctx.beginPath();
    //   ctx.arc(dx, dy, 20, 0, 2 * Math.PI, false);
    //   ctx.fillStyle = '#0F0F0F';
    //   ctx.fill();

    //   //  Because we're changing the context manually, we need to tell Phaser the texture is dirty.
    //   //  You only need to do this in WebGL mode. In Canvas it's not needed.
    //   this.terrainBM.dirty = true;
    // }
  },

  clickListener: function() {
    this.game.state.start('gameover');
  },

  shootListener: function() {
    var dx = this.game.input.x - this.terrain.x
      , dy = this.game.input.y - this.terrain.y
      , ctx = this.terrainBM.context;

    ctx.beginPath();
    ctx.arc(dx, dy, 20, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#000';
    ctx.fill();
    //  Because we're changing the context manually, we need to tell Phaser the texture is dirty.
    //  You only need to do this in WebGL mode. In Canvas it's not needed.
    this.terrainBM.dirty = true;
  },

  createPlayer: function(x, y) {
    var sprite = this.game.add.sprite(x, y, 'tank');
    sprite.inputEnabled = true;

    this.game.physics.p2.enable(sprite, false);

    sprite.body.collideWorldBounds = true;
    // sprite.body.fixedRotation = true;
    //this.sprite.body.velocity.x = this.game.rnd.integerInRange(-500,500);
    sprite.body.velocity.y = this.game.rnd.integerInRange(-50,-200);
    sprite.events.onInputDown.add(this.clickListener, this);
  },

  createTerrain: function(vertices, vWidth) {
    var sprite
      , batch = this.game.add.spriteBatch(this.game, null, 'voxels');

    for (var i = vertices.length - 1; i >= 0; i--) {
        sprite = batch.create(vertices[i][0] * vWidth, vertices[i][1] * vWidth, 'box32');
        this.game.physics.p2.enable(sprite, false);
        // sprite.anchor.set(0, 0);
        sprite.body.collideWorldBounds = true;
        // sprite.body.static = true;
    }

    // this.game.physics.p2.enable(voxels, true);
    return batch;
  }

};

/**
 * Exports
 */

module.exports = Play;
