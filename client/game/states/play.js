/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var _globals = require('../../../shared/globals')
  , packets = require('../../../shared/packets')
  , GameFactory = require('../gameobjects')
  , GameClient = require('../gameclient_mock')
  , Player = require('../player');

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
    this.player.update(this.cursors);
  },
  /**
   * Create artifcats after the game has been initialized
   */
  postCreate: function() {

    this.gamefactory.addWater(64);

  },
  /**
   * Handle server messages
   */
  onReceivePacket: function(packet, data) {
    _globals.debug('-- New packet --', packet, data);

    switch(packet) {
      /**
       * Connected to server
       */
      case packets.CONNECTED:
        _globals.debug('[client] Connected to', data.server.name);
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

        this.gamefactory.addWalls(data.screen.width, data.screen.height);
        this.gamefactory.addGround(data.screen.width, data.screen.height);

        // add game objects
        // this.voxels = this.gamefactory.addBlocks(data.level.blocks[0], data.level.blocks[1]);

        // add player sprite
        var playerSprite = this.gamefactory.addPlayer(data.player.x, data.player.y);
        this.player = new Player(playerSprite);
        // body.velocity[0] = this.game.rnd.integerInRange(-5,10);
        // body.velocity[1] = this.game.rnd.integerInRange(-5,10);
        // this.player2 = this.createPlayer(350, 50);
        // this.player3 = this.createPlayer(550, 50);
        // this.player4 = this.createPlayer(750, 50);

        // create additional in-game objects
        this.postCreate();

        // all objects initalized => start game
        this.gameStarted = true;
      break;
      /**
       * Unknown packet
       */
      default:
        _globals.debug('[client] Unknown packet', packet);
      break;
    }
  },

};

/**
 * Exports
 */

module.exports = Play;
