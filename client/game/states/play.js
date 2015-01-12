/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var _ = require('lodash')
  , _globals = require('../../../shared/globals')
  , packets = require('../../../shared/packets')
  , Physics = require('../../../shared/physics')()
  , GameFactory = require('../gamefactory');

function Play() {}

Play.prototype = {

  create: function() {
    var self = this
      , conf = this.game.cache.getJSON('gameconf');

    // By default if the browser tab loses focus the game will pause.
    // You can stop that behaviour by setting this property to true.
    this.game.stage.disableVisibilityChange = true;

    this.gamefactory = new GameFactory(this.game);

    // add client graphics
    {
      this.backdrop = this.game.add.sprite(0, 0, 'sky01');

      // add fps counter
      var font = { font: '13px Arial', fill: '#ffffff' };
      this.game.time.advancedTiming = true;

      this.dbgInfo = [];
      this.texts = {};
      this.texts.fps = this.game.add.text(this.game.width - 45, 5, 'fps:', font);
      this.texts.ping = this.game.add.text(this.game.width - 105, 5, 'ping:', font);
      this.texts.gameid = this.game.add.text(this.game.width - 105, 17, 'gid:', font);
    }

    // sprites & in-game objects
    this.player = null;
    this.enemies = [];

    // game has not yet started
    this.gameStarted = false;

    // init in-game chat props
    var chatFont = { font: '13px Arial', fill: '#ffffff' }
      , sentFont = { font: '13px Arial', fill: '#95B9C7' };
    this.game.input.keyboard.addCallbacks(this, this.onKeyDown);
    this.chat = {};
    this.chat.active = false;
    this.chat.message = '';
    this.chat.buffer = [];
    this.chat.hud = this.game.add.text(5, 5, '', chatFont);
    this.chat.hud.setShadow(1, 1, '#333', 4);
    this.chat.lines = [];
    for (var i = 0, ly = 17; i < _globals.MAX_CHAT_MESSAGES; i++, ly += 12) {
      this.chat.lines[i] = this.game.add.text(5, ly, '', sentFont);
      this.chat.lines[i].setShadow(1, 1, '#333', 2);
      // this.chat.lines[i].setText('Test ' + i);
    }

    // Update physics 60 times / second
    var runPhysics = function(callback) {
      setTimeout(callback, 1000 / 60);
    };
    var updatePhysics = function() {
      if (this.gameStarted) {
        /**
         * Interpolate physics update
         * We go 6 steps forward because we expect the
         * physics to run 1/60 on client side, e.g.,
         * interpolate ~= 1000 / 10 * 6
         */
        var now = Date.now() / 1000;
        this.lastCallTime = this.lastCallTime || now;
        var timeSinceLastCall = now - this.lastCallTime;
        this.lastCallTime = now;
        this.gamefactory.physics.update(timeSinceLastCall, 3);
        // this.physics.update2(1.0 / 10);
      }
      runPhysics(updatePhysics.bind(this));
    }.bind(this);
    runPhysics(updatePhysics);

    /**
     * Connect to server and join a game
     */

    var serverUrl = conf.server || 'http://127.0.0.1:3000';
    serverUrl += '/loosecannon';

    var socket = io.connect(serverUrl);
    this.socket = socket;

    this.packetSeq = 0;

    socket.on(packets.CONNECTED, function (data) {
      _globals.debug('Connected to server' + data.server.name);
    });
    socket.on(packets.PING, function (data) {
      if ('ping' in self.texts) {
        var diff = Date.now() - data.t;
        self.texts.ping.setText('ping: ' + diff);
      }
    });
    socket.on(packets.SEND_CHAT_MSG, function (data) {
      self.forPlayer(data.pid, true, function (player) {
        // console.log(data);
        self.addChatMsg(player, data.t);
      });
    });
    socket.on(packets.GAME_JOINED, function (data) {
      // hack
      if (self.gameStarted) {
        window.location.reload();
      }

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
    socket.on(packets.PLAYER_HIT, function (data) {
      self.forPlayer(data.pid, true, function (player) {
        player.onDamage(data);

        // console.log('player is hit ', player.id, player.x, player.y);

        if (!player.alive) {
          // play destruction animation
          self.gamefactory.addParticleExplosion(player.x, player.y);

          // TODO: GAMEOVER SCREEN
          if (self.player.id === player.id) {
            self.game.state.start('gameover');
          }
        }
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
    var i, j, cn;

    // draw fps
    if (game.time.fps !== 0) {
      this.texts.fps.setText('fps: ' + game.time.fps);
    }

    // draw chat texts
    if (this.chat.buffer.length > 0) {
      cn = Math.min(_globals.MAX_CHAT_MESSAGES, this.chat.buffer.length);
      j = this.chat.buffer.length - 1;
      for (i = 0; i < cn; i++) {
        this.chat.lines[i].setText(this.chat.buffer[j - i]);
      }
    }

    if (!this.gameStarted) {
      return;
    }

    this.gamefactory.update();

    if (this.player.alive) {
      this.player.update(this.game, this.sendPacket.bind(this));
      this.player.render(this.game);
    }

    // render names
    for (i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].alive) {
        this.enemies[i].render(this.game);
      }
    }
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
    this.gamefactory.initPhysics(data.physics, this.onImpact.bind(this));

    // add environment objects
    this.gamefactory.addWalls(_globals.SCREEN_WIDTH, _globals.SCREEN_HEIGHT);
    this.gamefactory.addGround(_globals.SCREEN_WIDTH, _globals.SCREEN_HEIGHT);

    // add game objects
    this.gamefactory.addBullets(_globals.MAX_BULLETS);
    this.gamefactory.addExplosions();
    // this.voxels = this.gamefactory.addBlocks(data.level.blocks[0], data.level.blocks[1]);

    var yDelta = -5;

    // add enemy sprites
    for (var i = 0, count = data.enemies.length; i < count; i++) {
      var enemy = data.enemies[i];
      // only add non-destroyed enemies
      if (enemy.alive) {
        var enemyEntity = this.gamefactory.addPlayer(enemy.x + yDelta,
          enemy.y + yDelta);
        _.merge(enemyEntity, enemy);
        this.enemies.push(enemyEntity);
      }
    }

    // add player sprite
    if (!data.player.alive) {
      _globals.debug('Killed while joining!');
      // TODO: killed while joining
      // redirect to main
    }
    this.player = this.gamefactory.addPlayer(data.player.x + yDelta,
      data.player.y + yDelta);
    _.merge(this.player, data.player);
    this.player.setSocket(this.socket);

    // create additional in-game objects
    this.postCreate();

    // all objects initalized => start game
    this.gameStarted = true;

    // debug info
    this.texts.gameid.setText('gid: ' + data.gid);
    this.startPing();
  },
  /**
   * Resolve local client collisions
   */
  onImpact: function(event) {
    var self = this
      , physics = this.gamefactory.physics;

    physics.isCollide(event.bodyA, event.bodyB, _globals.masks.BULLET,
      function(bodyA, bodyB, cgA, cgB) {
        if (!bodyA) {
          return;
        }

        // explode
        var x = Physics.mpxi(bodyA.position[0])
          , y = Physics.mpxi(bodyA.position[1]);

        if (cgB === _globals.masks.WALL_LEFT) {
          bodyA.position[0] = Physics.pxmi(self.game.width - _globals.WIDTH_BULLET - 5);
          bodyA.angle = -bodyA.angle;
          // bodyA.velocity[0] = -bodyA.velocity[0];
          // bodyA.moveForward(100, bodyA.angle);
        } else if (cgB === _globals.masks.WALL_RIGHT) {
          bodyA.position[0] = Physics.pxmi(5);
          bodyA.velocity[0] = -bodyA.velocity[0];
        } else {
          self.gamefactory.addExplosion(x, y);
          self.gamefactory.removeBullet(bodyA);
        }

        // if (cgB === _globals.masks.PLAYER) {
        //   // console.log(cgB, _globals.masks.PLAYER, bodyB.id, self.player.spirit.id);
        //   if (bodyB.id !== self.player.spirit.id) {
        //     // explode
        //     var x = Physics.mpxi(bodyA.position[0])
        //       , y = Physics.mpxi(bodyA.position[1]);
        //     // self.gamefactory.addExplosion(x, y);

        //     // self.gamefactory.removeBullet(bodyA);

        //     self.gamefactory.addParticleExplosion(x, y);
        //   }
        //   // enemy player damage
        // } else {
        //   console.log('hit something else', bodyA.id, bodyB.id);
        //   // explode
        //   var x = Physics.mpxi(bodyA.position[0])
        //     , y = Physics.mpxi(bodyA.position[1]);
        //   self.gamefactory.addExplosion(x, y);

        //   self.gamefactory.removeBullet(bodyA);
        // }
    });
  },
  /**
   * Handle user keyboard/text input
   */
  onKeyDown: function(event) {
    var flush = false;

    // TODO: Optimize this by using buffers instead of strings!!
    //       Actually, this whole function needs to be rewritten. ;)

    if(event.which === 33 || (event.which < 48 || event.which > 59) &&
      (event.which < 63 || event.which > 90)) {

      var len = this.chat.message.length;

      // start typing or send chat message
      if (event.which === 13) {
        if (this.chat.active && this.chat.message.trim().length > 0) {
          // send
          this.sendPacket(packets.SEND_CHAT_MSG, {t: this.chat.message});
          // reset msg
          this.chat.message = '';
        } else if (!this.chat.active) {
          // starts typing new msg
          this.chat.message = ' ';
          // make sure text is placed top-most
          this.chat.hud.parent.bringToTop(this.chat.hud);
        }

        this.chat.active = !this.chat.active;
        flush = true;

      } else if (event.which === 32 && this.chat.active && len <= _globals.MAX_CHAT_MSG_SIZE) {
        this.chat.message += ' ';

      } else if (event.which === 8 && this.chat.active) {
        if (len > 1) { // assume 1 space
          this.chat.message = this.chat.message.substring(0, len - 1);
          flush = true;
        }
      }

    } else if (this.chat.active && this.chat.message.length <= _globals.MAX_CHAT_MSG_SIZE) {
      var letter = String.fromCharCode(event.which);

      if(!event.shiftKey) {
        letter = letter.toLowerCase();
      } else if (letter === '1') {
        letter = '!';
      }

      this.chat.message += letter;
      flush = true;
    }

    if (flush) {
      if (this.chat.message.length > 0) {
        this.chat.hud.setText(this.player.name + ':' + this.chat.message);
      } else {
        this.chat.hud.setText('');
      }
    }

  },

  addChatMsg: function(player, msg) {
    this.chat.buffer.push(player.name + ': ' + msg);
    if (this.chat.buffer.length > _globals.MAX_CHAT_MESSAGES) {
      this.chat.buffer.shift();
    }
  },
  /**
   * Start regular ping to server
   */
  startPing: function() {
    // Update physics 60 times / second
    var runPing = function(callback) {
      setTimeout(callback, _globals.PING_TIMEOUT);
    };
    var ping = function() {
      if (this.gameStarted) {
        this.sendPacket(packets.PING, {t: Date.now()});
      }
      runPing(ping.bind(this));
    }.bind(this);
    runPing(ping);
  },
  /**
   * Find player avatar for which the server sent
   * a packet update.
   */
  forPlayer: function(pid, includeMe, callback) {
    if (typeof includeMe !== 'function' && includeMe) {
      if (pid === this.player.id) {
        callback(this.player);
        return;
      }
    } else {
      callback = includeMe;
    }
    // else
    // skip, because we already did this action locally, at client side!

    for (var i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].id === pid) {
        callback(this.enemies[i]);
        return;
      }
    }
  },


};

/**
 * Exports
 */

module.exports = Play;
