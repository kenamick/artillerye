/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

/*jshint -W030 */
'use strict';

var _ = require('lodash')
  , uuid = require('node-uuid')
  , _globals = require('../shared/globals')
  , packets = require('../shared/packets')
  , Physics = require('../shared/physics')()
  , Spirits = require('../shared/spirits')
  , Player = require('../shared/player');

function GameProc(send) {
  this.send = send;
  this.physics = null;
  this.players = [];

  /**
   * Current game state
   */
  this.config = {
    physics: {
      restitution: 0.75,
      gravity: {x: 0, y: 150}
    },
    players: [
      [150, 400],
      [450, 400],
      [750, 400]
    ]
  };
}

GameProc.prototype = {

  startPhysics: function() {
    // Update physics 10 times / second
    var cb = function(callback) {
      setTimeout(callback, 1000 / 10);
    };
    var updatePhysics = function() {
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
      this.physics.update(timeSinceLastCall, 6);
      // this.physics.update2(1.0 / 10);

      cb(updatePhysics.bind(this));
    }.bind(this);
    cb(updatePhysics);
  },

  initGame: function() {
    this.gameid = uuid.v1();

    _globals.debug('!!!Created New Game!!!', this.gameid);

    // init server side physics
    this.physics = Physics.create({
      restitution: this.config.physics.restitution,
      gravity: this.config.physics.gravity
    });
    this.physics.setImpactHandler(this.onImpact.bind(this));

    this.spirits = Spirits(this.physics);

    // add game objects
    this.spirits.addWalls(_globals.SCREEN_WIDTH, _globals.SCREEN_HEIGHT);
    this.spirits.addGround(_globals.SCREEN_WIDTH, _globals.SCREEN_HEIGHT);

    // add players slots
    // initially all are AI controlled
    for (var i = 0; i < _globals.MAX_CLIENTS; i++) {
      var spirit = this.spirits.addPlayer(this.config.players[i][0], this.config.players[i][1],
        _globals.WIDTH_PLAYER, _globals.HEIGHT_PLAYER);

      var player = new Player(null, spirit, this.spirits);
      player.id = (i + 1);
      player.ai = true;
      player.name = 'Player ' + (i + 1);
      this.players.push(player);
    }

    this.startPhysics();
  },

  joinClient: function(socket) {
    var data = {
      gid: this.gameid.substr(0, 7),
      player: {},
      enemies: []
    };

    // find empty AI slot
    var found = false;

    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      var entity = player.getProps();

      if (!found && player.ai && player.alive) {
        player.ai = false;
        player.setSocket(socket);

        entity.name = 'ME';
        data.player = entity;

        found = true;
      } else {
        data.enemies.push(entity);
      }
    }

    if (!found) {
      console.log('Room got full!');
      // TODO:
      // Someone else has already joined.
      // Send player back to lobby.
    }

    // join game room
    socket.join(this.gameid);

    // send game inital info to player
    // TODO: send game state!
    _.extend(data, this.config);
    this.send(socket, packets.GAME_JOINED, data);

    // adjust callbacks
    var self = this;

    socket.on(packets.PING, function (data) {
      self.send(socket, packets.PING, data);
    });
    socket.on(packets.PLAYER_SHOOT, function (data) {
      self.forPlayer(socket.id, data.pid, function (player) {
        player.shoot(data);
        self.send(self.gameid, packets.PLAYER_SHOOT, data);
      });
    });
    socket.on(packets.PLAYER_MOVE, function (data) {
      self.forPlayer(socket.id, data.pid, function (player) {
        player.move(data);
        self.send(self.gameid, packets.PLAYER_MOVE, data);
      });
    });
    socket.on('disconnect', function () {
      /**
       * Some player quits the game. Set AI control to his entity.
       */
      for (var i = 0; i < self.players.length; i++) {
        if (!self.players[i].ai && self.players[i].getSocketId() === socket.id) {
          _globals.debug('Player Quit! ' + socket.id);
          self.players[i].ai = true;
        }
      }
    });
  },
  /**
   * Handle impacts between all in-game objects
   * Note: An impact may be registered twice even if you remove the body right after detecting it.
   * This happens because of the following (from p2js docs):
   *   "Remove a body from the simulation. If this method is called during step(), the body removal"
   *   "is scheduled to after the step.""
   */
  onImpact: function(event) {
    var self = this;

    this.physics.isCollide(event.bodyA, event.bodyB, _globals.masks.BULLET,
      function(bodyA, bodyB, cgA, cgB) {
        if (!bodyA || bodyA.isCol) {
          return;
        }

        bodyA.isCol = true;

        if (cgB === _globals.masks.PLAYER) {
          console.log('hit player');
          self.forPlayerBody(bodyB.id, function (player) {
            console.log('player %d hits player %d', bodyA.playerId, player.id);
            if (player.alive) {

              player.doDamage(51);
              if (!player.alive) {
                player.kill();
              }

              // notify
              self.send(self.gameid, packets.PLAYER_HIT, {
                pid: player.id,
                d: 51
              });
            }
          });
          // console.log(cgB, _globals.masks.PLAYER, bodyB.id, self.player.spirit.id);
          // if (bodyB.id !== self.player.spirit.id) {
          //   // explode
          //   var x = Physics.mpxi(bodyA.position[0])
          //     , y = Physics.mpxi(bodyA.position[1]);
          //   // self.gamefactory.addExplosion(x, y);

          //   // self.gamefactory.removeBullet(bodyA);

          //   self.gamefactory.addParticleExplosion(x, y);
          // }
          // enemy player damage
        } else {
          console.log('hit something else', bodyA.id, bodyB.id);
          // explode
          // var x = Physics.mpxi(bodyA.position[0])
          //   , y = Physics.mpxi(bodyA.position[1]);
          // self.gamefactory.addExplosion(x, y);

          // self.gamefactory.removeBullet(bodyA);
          // self.spirits.remove(bodyA);
          self.physics.world.removeBody(bodyA);
        }
    });
  },

  isFull: function() {
    for (var i = this.players.length - 1; i >= 0; i--) {
      if (this.players[i].ai && this.players[i].alive) {
        return false;
      }
    }
    return true;
  },

  forPlayer: function(socketId, playerId, callback) {
    if (callback === null) {
      var callback = playerId;
      for (var i = this.players.length - 1; i >= 0; i--) {
        if (this.players[i].id === socketId) {
          callback && callback(this.players[i]);
          break;
        }
      }
    } else {
      for (var i = this.players.length - 1; i >= 0; i--) {
        if (this.players[i].getSocketId() === socketId &&
          this.players[i].id === playerId) {
          callback && callback(this.players[i]);
          break;
        }
      }
    }
  },

  forPlayerBody: function(bodyId, callback) {
    for (var i = this.players.length - 1; i >= 0; i--) {
      if (this.players[i].spirit.id === bodyId) {
        callback && callback(this.players[i]);
        break;
      }
    }
  },
};

/**
 * Exports
 */

 module.exports = GameProc;
