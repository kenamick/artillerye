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
  , Physics = require('../../../shared/physics')()
  , GameFactory = require('../gamefactory');

// var server_url = 'http://192.168.1.101:3000/loosecannon';
var server_url = 'http://127.0.0.1:3000/loosecannon';

function Play() {};

Play.prototype = {

  create: function() {
    var self = this;

    this.gamefactory = new GameFactory(this.game);

    // add client graphics
    {
      this.backdrop = this.game.add.sprite(0, 0, 'sky01');

      // add fps counter
      var font = { font: '14px Arial', fill: '#ffffff' };
      this.game.time.advancedTiming = true;
      this.fpsText = this.game.add.text(5, 5, '', font);
      this.txtName = this.game.add.text(5, 16, '', font);
    }

    // sprites & in-game objects
    this.player = null;
    this.enemies = [];

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
    this.socket = socket;

    this.packetSeq = 0;    

    socket.on(packets.CONNECTED, function (data) {
      console.log('Connected to server' + data.server.name)
    });

    socket.on(packets.GAME_JOINED, function (data) {
      // hack
      if (self.gameStarted)
        window.location.reload();

      self.onGameJoined(data);
    });
    socket.on(packets.PLAYER_SHOOT, function (data) {
      self.forPlayer(data.pid, function (player) {
        player.onShoot(data);
      });
    });
    socket.on(packets.PLAYER_MOVE, function (data) {
      self.forPlayer(data.pid, function (player) {
        player.onMove(data);
      });
    });    
    socket.on('disconnect', function () {
      _globals.debug('!!Disconnected!!');
      self.gameStarted = false;
      //TODO: bring player back to lobby
    });
  },
  /**
   * Game update loop
   */
  update: function(game) {
    // draw fps
    if (game.time.fps !== 0) {
      this.fpsText.setText('fps: ' + game.time.fps);
      if (this.player) {
        this.txtName.setText('name: ' + this.player.name);
      }
    }

    if (!this.gameStarted)
      return;

    this.gamefactory.update();
    this.player.update(this.game, this.sendPacket.bind(this));
    this.player.render(this.game);

    // render names
    for (var i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].render(this.game);
    };
  },
  /**
   * Create artifcats after the game has been initialized
   */
  postCreate: function() {

    this.gamefactory.addWater(_globals.TILE_SIZE);

  },
  /**
   * Send a packet to server. Compress & serialize, if needed.
   */
  sendPacket: function(packet, data) {
    _.extend(data, {
      pid: this.player.id,
      sq: ++this.packetSeq
    });
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
    this.gamefactory.addExplosions();
    // this.voxels = this.gamefactory.addBlocks(data.level.blocks[0], data.level.blocks[1]);

    // add enemy sprites
    for (var i = 0, count = data.enemies.length; i < count; i++) {
      var enemy = data.enemies[i];
      var enemyEntity = this.gamefactory.addPlayer(enemy.x, enemy.y);
      enemyEntity.name = enemy.name;
      enemyEntity.id = enemy.id;
      this.enemies.push(enemyEntity);
    }

    // add player sprite
    this.player = this.gamefactory.addPlayer(data.player.x, data.player.y);
    this.player.id = data.player.id;
    this.player.name = data.player.name;
    this.player.setSocket(this.socket);

    _globals.debug('Joined game:', data.player.x, data.player.y);

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
          if (bodyB.id !== self.player.spirit.id) {
            // explode
            var x = Physics.mpxi(bodyA.position[0])
              , y = Physics.mpxi(bodyA.position[1]);
            // self.gamefactory.addExplosion(x, y);

            // self.gamefactory.removeBullet(bodyA);

            self.gamefactory.addParticleExplosion(x, y);
          }
          // enemy player damage
        } else {
          // explode
          var x = Physics.mpxi(bodyA.position[0])
            , y = Physics.mpxi(bodyA.position[1]);
          self.gamefactory.addExplosion(x, y);

          self.gamefactory.removeBullet(bodyA);
        }
    });
  },
  /**
   * Find player avatar for which the server sent
   * a packet update.
   */
  forPlayer: function(pid, callback) {
    if (pid === this.player.id) {
      // skip, because we already did this action locally, at client side!
      // callback(this.player);
    } else {
      for (var i = this.enemies.length - 1; i >= 0; i--) {
        if (this.enemies[i].id === pid)
          callback(this.enemies[i]);
      }
    }
  },

};

/**
 * Exports
 */

module.exports = Play;
