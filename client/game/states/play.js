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
  , GameClient = require('../gameclient_mock');

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

    // run physics update
    // var cb = function(callback) {
    //   window.setTimeout(callback, 1000 / 40);
    // };
    // var updatePhysics = function() {
    //   if (!this.gameStarted)
    //     return;
    //   this.gamefactory.update();
    //   cb(updatePhysics);
    // }.bind(this);
    // cb(updatePhysics);

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
    this.player.update(this.game, this.gameclient);
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
        this.gamefactory.addBullets(_globals.MAX_BULLETS);
        // this.voxels = this.gamefactory.addBlocks(data.level.blocks[0], data.level.blocks[1]);

        // add player sprite
        this.player = this.gamefactory.addPlayer(data.player.x, data.player.y);

        // create additional in-game objects
        this.postCreate();
        
        // all objects initalized => start game
        this.gameStarted = true;
      break;

      case packets.PLAYER_UPDATED:
        this.player.onReceivePacket(data.tag, data.data);
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
