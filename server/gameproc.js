
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
    _globals.debug('!!!Created New Game!!!');

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

      var player = new Player(null, spirit);
      player.ai = true;

      this.players.push(player);
    }
  },

  joinClient: function(socket) {
    var data = {};

    // find empty AI slot
    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      if (player.ai) {
        player.ai = false;
        player.setSocket(socket);

        data.player = {
          x: player.x,
          y: player.y
        };
        break;
      }
    };

    _.extend(data, this.config);

    // notify player
    this.send(socket, packets.GAME_JOINED, data);

    // adjust callbacks
    socket.on(packets.UPDATE_PLAYER, this.updatePlayer.bind(this));
  },

  updatePlayer: function(data) {
    // TODO: mirror
    this.send(this.socket, packets.PLAYER_UPDATED, data);
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
  }

};

/**
 * Exports
 */

 module.exports = GameProc;
