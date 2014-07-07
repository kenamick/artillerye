
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
      [150, 500],
      [450, 500],
      [750, 500]
    ]
  };
};

GameProc.prototype = {

  update: function() {

  },

  initGame: function() {
    this.gameid = uuid.v1();

    _globals.debug('!!!Created New Game!!!', this.gameid);

    // init server side physics
    this.physics = Physics.create({
      restitution: this.config.physics.restitution,
      gravity: this.config.physics.gravity
    });
    this.spirits = Spirits(this.physics);

    // add players slots
    // initially all are AI controlled
    for (var i = 0; i < _globals.MAX_CLIENTS; i++) {
      var spirit = this.spirits.addPlayer(this.config.players[i][0], this.config.players[i][1],
        _globals.WIDTH_PLAYER, _globals.HEIGHT_PLAYER);

      var player = new Player(null, spirit, this.spirits);
      player.id = (i + 1);
      player.ai = true;

      this.players.push(player);
    }
  },

  joinClient: function(socket) {
    var data = {
      player: {},
      enemies: []
    };

    // find empty AI slot
    var found = false;

    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      var entity = {
        id: player.id,
        name: 'Player ' + (i+1),
        x: player.x,
        y: player.y
      };

      if (!found && player.ai) {
        player.ai = false;
        player.setSocket(socket);

        entity.name = 'ME';
        data.player = entity;

        found = true;
      } else {
        data.enemies.push(entity);
      }
    };

    if (!found) {
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

    socket.on(packets.PLAYER_SHOOT, function (data) {
      self.forPlayer(socket.id, data.pid, function (player) {
        self.send(self.gameid, packets.PLAYER_SHOOT, data);
      });
    });
    socket.on('disconnect', function () {
      /**
       * A player quits game. Set AI control to his entity.
       */
      for (var i = 0; i < self.players.length; i++) {
        if (!self.players[i].ai && self.players[i].getSocketId() == socket.id) {
          _globals.debug('Player Quit! ' + socket.id);
          self.players[i].ai = true;
        }
      };
    });
  },

  onImpact: function(event) {
    // type: "impact",
    // bodyA : null,
    // bodyB : null,
    // shapeA : null,
    // shapeB : null,
    // contactEquation : null,

    isCollide(event.bodyA, event.bodyB, _globals.masks.BULLET, _globals.masks.GROUND,
      function(bodyA, bodyB) {
        if (!bodyA)
          return;

        // TODO: remove body from local physics
        //
        // listener(packets.BULLET_HIT, data);

        console.log('bullet collides with ground! ', bodyA.id, bodyB.id);

    });
  },

  isFull: function() {
    for (var i = this.players.length - 1; i >= 0; i--) {
      if (this.players[i].ai)
        return false;
    };
    return true;
  },

  forPlayer: function(socketId, playerId, callback) {
    for (var i = this.players.length - 1; i >= 0; i--) {
      if (this.players[i].getSocketId() === socketId
        && this.players[i].id === playerId) {

        callback && callback(this.players[i]);
      }
    }
  },

};

/**
 * Exports
 */

 module.exports = GameProc;
