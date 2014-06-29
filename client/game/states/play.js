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
      gravity: {x: 0, y: 150}
    });
    this.physics.addWallTop(0, 0);
    this.physics.addWallBottom(0, gh);
    this.physics.addWallLeft(0, 0);
    this.physics.addWallRight(gw, 0);

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

    // this.game.input.onDown.add(this.click, this);
    this.cursors = this.game.input.keyboard.createCursorKeys();
  },

  update: function(game) {
    // draw fps
    if (game.time.fps !== 0) {
      this.fpsText.setText(game.time.fps + ' FPS');
    }

    this.physics.update();

    // move player 1
    if (this.cursors.left.isDown) {
      this.player1.spirit.rotateLeft(25);
    } else if (this.cursors.right.isDown) {
      this.player1.spirit.rotateRight(25);
    } else {
      this.player1.spirit.setZeroRotation();
    }

    if (this.cursors.up.isDown) {
      this.player1.spirit.thrust(500);
    } else if (this.cursors.down.isDown) {
      this.player1.spirit.reverse(200);
    }

    this.updatePlayer(this.player1);
    this.updatePlayer(this.player2);
    this.updatePlayer(this.player3);
    this.updatePlayer(this.player4);
  },

  clickListener: function() {
    this.game.state.start('gameover');
  },

  updatePlayer: function(sprite) {
    // limit angle movement
    var angle = sprite.spirit.angle;
    if (angle > Math.PI/4) {
      sprite.spirit.setZeroRotation();
      sprite.spirit.angle = Math.PI / 4;
    } else if (angle < -Math.PI/4) {
      sprite.spirit.setZeroRotation();
      sprite.spirit.angle = -Math.PI / 4;
    }

    sprite.x = sprite.spirit.x;
    sprite.y = sprite.spirit.y;
    sprite.rotation = sprite.spirit.angle;
  },

  createPlayer: function(x, y) {
    var sprite = this.game.add.sprite(x, y, 'balloon');
    sprite.inputEnabled = true;

    var shape = this.physics.shapes.rect(sprite.width, sprite.height);
    var body = this.physics.addBody(x, y, shape, 1, 0);
    body.velocity[0] = this.game.rnd.integerInRange(-5,10);
    body.velocity[1] = this.game.rnd.integerInRange(-5,10);
    sprite.spirit = body;
    sprite.anchor.set(0.5);

    // this.game.physics.p2.enable(sprite, false);
    // sprite.body.collideWorldBounds = true;
    // // sprite.body.fixedRotation = true;
    // //this.sprite.body.velocity.x = this.game.rnd.integerInRange(-500,500);
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
