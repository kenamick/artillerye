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

var _ = require('lodash')
  , _globals = require('../../shared/globals')
  , packets = require('../../shared/packets')
  , GameProc = require('../../shared/gameproc');

/**
 * Exports
 */

module.exports = function(listener) {
  return {

    _setFakeData: function(physics) {
      this.gameproc.physics = physics;
      this.gameproc.physics.setImpactHandler(this.gameproc.onImpact);
    },

    connect: function(url, err) {
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

      this.gameproc = new GameProc(data);
      this.gameproc.initGame(function(gameData) {
        _.extend(data, gameData)
        listener(packets.GAME_JOINED, data);
      });
    },

    send: function(packet, data, err) {

      switch(packet) {
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

    }

  };
};
