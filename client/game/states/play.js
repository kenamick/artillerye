/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var EntitiesFactory = require('../entities.js')
  , GameClient = require('../gameclient_mock.js')
  , packets = require('../../../shared/packets');

function Play() {}

Play.prototype = {

  create: function() {

    this.entities = new EntitiesFactory(this.game);

    // add client graphics
    this.backdrop = this.game.add.sprite(0, 0, 'sky01');
    // add fps counter
    this.game.time.advancedTiming = true;
    this.fpsText = this.game.add.text(
      20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    );

    // game has not yet started
    this.gameStarted = false;

    // this.game.input.onDown.add(this.click, this);
    this.cursors = this.game.input.keyboard.createCursorKeys();

    // connect to server
    this.gameclient = GameClient(this.onReceivePacket.bind(this));
    this.gameclient.connect('dummy url');
  },

  update: function(game) {
    // draw fps
    if (game.time.fps !== 0) {
      this.fpsText.setText(game.time.fps + ' FPS');
    }

    if (!this.gameStarted)
      return;

    this.entities.update();

    // move player 1
    if (this.cursors.left.isDown) {
      this.player1.spirit.rotateLeft(25);
    } else if (this.cursors.right.isDown) {
      this.player1.spirit.rotateRight(25);
    } else {
      this.player1.spirit.setZeroRotation();
    }

    if (this.cursors.up.isDown) {
      this.player1.spirit.thrust(250);
    } else if (this.cursors.down.isDown) {
      this.player1.spirit.reverse(10);
    }

    this.updatePlayer(this.player1);
    // this.updatePlayer(this.player2);
    // this.updatePlayer(this.player3);
    // this.updatePlayer(this.player4);
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
  },

  onReceivePacket: function(packet, data) {
    console.log('-- New packet --', packet, data);

    switch(packet) {
      /**
       * Connected to server
       */
      case packets.CONNECTED:
        console.log('[client] Connected to', data.server.name);
        this.gameclient.send(packets.JOIN_GAME, {
          'name': 'Guest #1'
        });
      break;
      /**
       * New Game
       */
      case packets.GAME_JOINED:
        // create physics world
        this.entities.setPhysics(data.physics);

        // add terrain
        // var vertices = Terrain.create(30, 10);
        // this.voxels = this.createTerrain(vertices, 32);

        // add player sprite
        this.player1 = this.entities.addPlayer(data.player.x, data.player.y);
        // body.velocity[0] = this.game.rnd.integerInRange(-5,10);
        // body.velocity[1] = this.game.rnd.integerInRange(-5,10);
        // this.player2 = this.createPlayer(350, 50);
        // this.player3 = this.createPlayer(550, 50);
        // this.player4 = this.createPlayer(750, 50);

        // all objects initalized => start game
        this.gameStarted = true;
        console.log(this);
      break;
      /**
       * Unknown packet
       */
      default:
        console.log('[client] Unknown packet', packet);
      break;
    }
  },

};

/**
 * Exports
 */

module.exports = Play;
