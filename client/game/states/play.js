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
  , GameFactory = require('../gamefactory');

var server_url = 'http://localhost:3000/loosecannon';

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

    // this.gameclient = GameClientReal(this);
    // this.gameclient.connect('http://localhost:3000/game');

    /**
     * Connect to server and join a game
     */

    var socket = io.connect(server_url);
    var self = this;

    socket.on(packets.CONNECTED, function (data) {
      console.log('Connected to server' + data.server.name)
    });

    socket.on(packets.GAME_JOINED, function (data) {
      // hack
      if (self.gameStarted)
        location.reload();

      self.onGameJoined(data);
    });
    socket.on(packets.PLAYER_UPDATED, function (data) {
      self.player.onReceivePacket(data.tag, data.data);
    });

    this.socket = socket;
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
    this.player.update(this.game, this.sendPacket.bind(this));
  },
  /**
   * Create artifcats after the game has been initialized
   */
  postCreate: function() {

    this.gamefactory.addWater(64);

  },
  /**
   * Send a packet to server. Compress & serialize, if needed.
   */
  sendPacket: function(packet, data) {
    this.socket.emit(packet, data);
  },
  /**
   * Joined game
   */
  onGameJoined: function(data) {
    // create physics world
    this.gamefactory.initPhysics(data.physics);

    this.gamefactory.physics.setImpactHandler(this.onImpact.bind(this));

    this.gamefactory.addWalls(_globals.SCREEN_WIDTH, _globals.SCREEN_HEIGHT);
    this.gamefactory.addGround(_globals.SCREEN_WIDTH, _globals.SCREEN_HEIGHT);

    // add game objects
    this.gamefactory.addBullets(_globals.MAX_BULLETS);
    // this.voxels = this.gamefactory.addBlocks(data.level.blocks[0], data.level.blocks[1]);

    // add player sprite
    // for (var i = 0, count = data.players.length; i < count; i++) {
    //   var player = this.gamefactory.addPlayer(data.players[i][0], data.players[i][1]);
    //   // hack
    //   if (i === 0) {
    //     this.player = player;
    //     this.player.setSocket(this.socket);
    //   }
    // }
    this.player = this.gamefactory.addPlayer(data.player.x, data.player.y);
    this.player.setSocket(this.socket);
    console.log('game created');
    // create additional in-game objects
    this.postCreate();

    // all objects initalized => start game
    this.gameStarted = true;
  },
  /**
   * Update player props
   */
  onPlayerUpdated: function(data) {
    this.player.onReceivePacket(data.tag, data.data);
  },
  /**
   * Resolve local client collisions
   */
  onImpact: function(event) {
    var self = this
      , physics = this.gamefactory.physics;

    physics.isCollide(event.bodyA, event.bodyB, _globals.masks.BULLET,
      function(bodyA, bodyB, cgA, cgB) {
        if (!bodyA)
          return;

        if (cgB === _globals.masks.PLAYER) {
          // console.log(cgB, _globals.masks.PLAYER, bodyB.id, self.player.spirit.id);
          //bodyB.id !== self.player.spirit.id) {
          // enemy player damage
        } else {
          self.gamefactory.removeBullet(bodyA);
        }
    });
  }

};

/**
 * Exports
 */

module.exports = Play;
