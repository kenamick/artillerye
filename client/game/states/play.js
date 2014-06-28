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

    var gw = this.game.width;
    var gh = this.game.height;

    var Terrain = require('../../../shared/terrain');
    var Physics = require('../../../shared/physics');

    this.physics = new Physics({
      restitution: 0.9,
      gravity: {x: 0, y: -150}
    });
    this.physics.addWallTop(0, 0);
    this.physics.addWallBottom(0, gh);

    console.log(this.physics.world);

    // enable P2 physics
    // this.game.physics.startSystem(Phaser.Physics.P2JS);
    // this.game.physics.p2.restitution = 0.9;
    // this.game.physics.p2.gravity.y = 150;

    // add backdrop
    this.backdrop = this.game.add.sprite(0, 0, 'sky01');

    // add terrain
    var vertices = Terrain.create(30, 10);
    // this.voxels = this.createTerrain(vertices, 32);

    // add game tank sprite
    this.player1 = this.createPlayer(150, 50);
    this.player2 = this.createPlayer(350, 50);
    this.player3 = this.createPlayer(550, 50);
    this.player4 = this.createPlayer(750, 50);

    // fps
    this.game.time.advancedTiming = true;
    this.fpsText = this.game.add.text(
      20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    );

    this.game.input.onDown.add(this.click, this);
    this.cursors = this.game.input.keyboard.createCursorKeys();
  },

  update: function() {
    // draw fps
    if (this.game.time.fps !== 0) {
      this.fpsText.setText(this.game.time.fps + ' FPS');
    }

    // move player 1
    // if (this.cursors.left.isDown) {
    //   this.player1.body.rotateLeft(25);
    // } else if (this.cursors.right.isDown) {
    //   this.player1.body.rotateRight(25);
    // } else {
    //   this.player1.body.setZeroRotation();
    // }

    // if (this.cursors.up.isDown) {
    //   this.player1.body.thrust(5000);
    // } else if (this.cursors.down.isDown) {
    //   this.player1.body.reverse(2000);
    // }

    this.physics.update();

    this.player1.x = this.player1.spirit.position[0] * 20;
    this.player1.y = this.player1.spirit.position[1] * 20;
    // console.log(this.player1.x, this.player1.y);
    console.log(this.player1.spirit.position[0],this.player1.spirit.position[1]);
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

    var shape = this.physics.shapes.rect(sprite.width, sprite.height);
    var body = this.physics.addBody(x, y, shape);
    body.velocity[0] = 0;
    body.velocity[1] = 0;
    sprite.spirit = body;
    sprite.anchor.set(0.5);

    // this.game.physics.p2.enable(sprite, false);
    // sprite.body.collideWorldBounds = true;
    // // sprite.body.fixedRotation = true;
    // //this.sprite.body.velocity.x = this.game.rnd.integerInRange(-500,500);
    // // sprite.body.velocity.y = this.game.rnd.integerInRange(50, 70);
    // sprite.events.onInputDown.add(this.clickListener, this);
    // // sprite.body.motionState = p2.Body.KINEMATIC;// this.game.physics.p2.Body.KINEMATIC;
    // sprite.body.mass = 1;
    // // sprite.body.data.gravityScale = 0.125;
    return sprite;
  },

  createTerrain: function(vertices, vWidth) {
    var sprite
      , batch = this.game.add.spriteBatch(this.game, null, 'voxels');

    for (var i = vertices.length - 1; i >= 0; i--) {
        sprite = batch.create(vertices[i][0] * vWidth, vertices[i][1] * vWidth, 'box32');
        this.game.physics.p2.enable(sprite, false);
        // sprite.anchor.set(0, 0);
        sprite.body.collideWorldBounds = true;
        sprite.body.mass = 200;
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
