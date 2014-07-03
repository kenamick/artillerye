
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
  , _globals = require('./globals')
  , Physics = require('./physics')
  , Spirits = require('./spirits');

function GameProc(data) {
  this.physics = null;
};

GameProc.prototype = {

  update: function() {

  },

  initGame: function(cb) {
    var data = {
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

    var config = data.physics;

    // this.physics = new Physics({
    //   restitution: config.restitution,
    //   gravity: config.gravity
    // });
    // this.spirits = new Spirits(this.physics);

    cb(data);
  },

  updatePlayer: function() {

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
  }

};

/**
 * Exports
 */

 module.exports = GameProc;
