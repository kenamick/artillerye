
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
  , Physics = require('../shared/physics')
  , Spirits = require('../shared/spirits')
  , Player = require('../shared/player');

function GameProc(send) {
  this.send = send;
  this.physics = null;
  this.clients = [];

  this.config = {
    physics: {
      restitution: 0.75,
      gravity: {x: 0, y: 150}
    },
    player: {
      x: 150,
      y: 500
    },
    level: {
      blocks: [30, 5]
    }
  };
};

GameProc.prototype = {

  update: function() {

  },

  initGame: function(cb) {
    var config = this.config.physics;

    // this.physics = new Physics({
    //   restitution: config.restitution,
    //   gravity: config.gravity
    // });
    // this.spirits = new Spirits(this.physics);
  },

  joinClient: function(socket) {
    this.socket = socket;

    var data = {
      server: {
        name: 'Mindfields'
      },
      session: 'abcdef09',
      screen: {
        width: 960,
        height: 640
      }
    };
    _.extend(data, this.config);

    // notify player
    this.send(this.socket, packets.GAME_JOINED, data);

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
    return this.clients.length >= _globals.MAX_CLIENTS;
  }

};

/**
 * Exports
 */

 module.exports = GameProc;
