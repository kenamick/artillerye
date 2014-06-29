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

var packets = require('../../shared/packets');

/**
 * Exports
 */

module.exports = function(listener) {
  return {

    connect: function(url, data) {
      var data = {
        server: {
          name: 'Mindfields'
        }
      };
      listener(packets.CONNECTED, data);
    },

    send: function(packet, data) {

      switch(packet) {
        /**
         * Create game
         * @type {[type]}
         */
        case packets.JOIN_GAME:

          var data = {
            session: 'abcdef09',
            physics: {
              restitution: 0.9,
              gravity: {x: 0, y: 150}
            },
            player: {
              x: 150,
              y: 50
            }
          };
          listener(packets.GAME_JOINED, data);
        break;
        /**
         * Unknown packet
         */
        default:
          console.log("[server] Unknown packet!", packet);
        break;
      }

    },

  };
};
