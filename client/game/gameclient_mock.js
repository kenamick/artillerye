/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

/**
 * DUMMY SERVER
 */

var _globals = require('../../shared/globals')
  , packets = require('../../shared/packets');

/**
 * Exports
 */

module.exports = function(listener) {
  return {

    connect: function(url, err) {
      var data = {
        server: {
          name: 'Mindfields'
        }
      };
      listener(packets.CONNECTED, data);
    },

    send: function(packet, data, err) {

      switch(packet) {
        /**
         * Create game
         * @type {[type]}
         */
        case packets.JOIN_GAME:

          var data = {
            session: 'abcdef09',
            physics: {
              restitution: 0.75,
              gravity: {x: 0, y: 150}
            },
            player: {
              x: 150,
              y: 500
            },
            screen: {
              width: 960,
              height: 640
            },
            level: {
              blocks: [30, 5]
            }
          };
          listener(packets.GAME_JOINED, data);
        break;

        case packets.UPDATE_PLAYER:
          listener(packets.PLAYER_UPDATED, data);
        break;

        /**
         * Unknown packet
         */
        default:
          console.log("[server] Unknown packet!", packet);
        break;
      }

    },

    dummyHandler: function(event) {
      // type: "impact",
      // bodyA : null,
      // bodyB : null,
      // shapeA : null,
      // shapeB : null,
      // contactEquation : null,

      /**
       * Handy collision helper.
       * We always know that that the bodyA in the callback
       * corresponds to maskA passed. 
       */
      var isCollide = function(bodyA, bodyB, maskA, maskB, cb) {
        var shapeA = bodyA.shapes[0]
          , shapeB = bodyB.shapes[0];

        if (shapeA.collisionGroup == maskA && shapeB.collisionGroup == maskB) {
          cb(bodyA, bodyB);
        } else if (shapeA.collisionGroup == maskB && shapeB.collisionGroup == maskA) {
          cb(bodyB, bodyA);
        } else {
          cb(false);
        }
      }

      isCollide(event.bodyA, event.bodyB, _globals.masks.BULLET, _globals.masks.GROUND, 
        function(bodyA, bodyB) {
          if (!bodyA)
            return;

          // TODO: remove body from local physics
          // 
          listener(packets.BULLET_HIT, data);

          console.log('bullet collides with ground! ', bodyA.id, bodyB.id);

      });
    }

  };
};
