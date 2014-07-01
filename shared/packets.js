/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var Packets = {
  /**
   * Client conneted to server
   */
  CONNECTED: 'pk_connected',
  /**
   * Client asks to join a game
   */
  JOIN_GAME: 'pk_join',
  /**
   * Server has joined client to a game
   */
  GAME_JOINED: 'pk_gamejoined',
  /**
   * Client updates it's player's position
   */
  UPDATE_PLAYER: 'pk_updateplr',
  /**
   * Server informs clients that some player's
   * data has been updated
   */
  PLAYER_UPDATED: 'pk_plrupdated',
  /**
   * Client quits game
   */
  QUIT_GAME: 'pk_quit',

  /**
   * Player updates tags
   */
  player: {
    MOVE: 'pkp_move'
  }
};

module.exports = Packets;
