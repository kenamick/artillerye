/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var GameFactory = require('../gameobjects.js')
  , GameClient = require('../gameclient_mock.js')
  , packets = require('../../../shared/packets');

function Play() {};

Play.prototype = {

  create: function() {

    this.gamefactory = new GameFactory(this.game);

    // add client graphics
    {
      this.backdrop = this.game.add.sprite(0, 0, 'sky01');

      // add fps counter
      this.game.time.advancedTiming = true;
      this.fpsText = this.game.add.text(
        20, 20, '', { font: '16px Arial', fill: '#ffffff' }
      );
    }

    // game has not yet started
    this.gameStarted = false;

    // this.game.input.onDown.add(this.click, this);
    this.cursors = this.game.input.keyboard.createCursorKeys();

    // connect to server
    this.gameclient = GameClient(this.onReceivePacket.bind(this));
    this.gameclient.connect('dummy url', function() {
      //TODO: Error handling
    });
  },
  /**
   * Game update loop
   */
  update: function(game) {
    // draw fps
    if (game.time.fps !== 0) {
      this.fpsText.setText(game.time.fps + ' FPS');
    }

    if (!this.gameStarted)
      return;

    this.gamefactory.update();
    this.updatePlayer(this.player);
  },
  /**
   * Adjust player movement & constraints
   */
  updatePlayer: function(sprite) {

    // player input
    if (this.cursors.left.isDown) {
      this.player.spirit.rotateLeft(25);
    } else if (this.cursors.right.isDown) {
      this.player.spirit.rotateRight(25);
    } else {
      this.player.spirit.setZeroRotation();
    }

    if (this.cursors.up.isDown) {
      this.player.spirit.thrust(250);
    } else if (this.cursors.down.isDown) {
      this.player.spirit.reverse(10);
    }

    // limit angle movement
    var angle = sprite.spirit.angle;
    if (angle > Math.PI/4) {
      sprite.spirit.setZeroRotation();
      sprite.spirit.angle = Math.PI / 4;
    } else if (angle < -Math.PI/4) {
      sprite.spirit.setZeroRotation();
      sprite.spirit.angle = -Math.PI / 4;
    }
  },

  clickListener: function() {
    this.game.state.start('gameover');
  },
  /**
   * Handle server messages
   */
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
        this.gamefactory.setPhysics(data.physics);

        this.gamefactory.addWalls(data.terrain.width, data.terrain.height);

        // add game objects
        this.voxels = this.gamefactory.addBlocks(20, 10);

        // add player sprite
        this.player = this.gamefactory.addPlayer(data.player.x, data.player.y);
        // body.velocity[0] = this.game.rnd.integerInRange(-5,10);
        // body.velocity[1] = this.game.rnd.integerInRange(-5,10);
        // this.player2 = this.createPlayer(350, 50);
        // this.player3 = this.createPlayer(550, 50);
        // this.player4 = this.createPlayer(750, 50);

        // all objects initalized => start game
        this.gameStarted = true;
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
