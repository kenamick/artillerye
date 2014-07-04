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

module.exports = function(listener) {
  return {

    connect: function(url, err) {
      var socket = io.connect(url);
      socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
      });

      this.socket = socket;
    },

    send: function(packet, data, err) {

    },

  };
};
