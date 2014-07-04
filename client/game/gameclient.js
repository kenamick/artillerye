/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

// TODO: Implement server socket.io routines

var packets = require('../../shared/packets');

/**
 * Exports
 */

module.exports = function(gamePlay) {
  return {

    connect: function(url) {
      var socket = io.connect(url);
      this.socket = socket;

      socket.on(packets.CONNECTED, function (data) {
        console.log('Connected to server' + data.server.name)
      });

      socket.on(packets.GAME_JOINED, function (data) {
        // hack
        if (gamePlay.gameStarted)
          location.reload();

        gamePlay.onGameJoined(data);
      });
    },

    send: function(packet, data, err) {
      console.log('[client][send pck]', packet, data);
      this.socket.emit(packet, data);
    },

  };
};
