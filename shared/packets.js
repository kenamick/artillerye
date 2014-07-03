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
   * Client: asks to join a game
   */
  JOIN_GAME: 'pk_join',
  /**
   * Server: Client joined game
   */
  GAME_JOINED: 'pk_gamejoined',
  /**
   * Client: Updates player position
   */
  UPDATE_PLAYER: 'pk_updateplr',
  /**
   * Server: A player has been updated
   */
  PLAYER_UPDATED: 'pk_plrupdated',
  /**
   * Server: Bullet hit something
   */
  BULLET_HIT: 'pk_bullethit',
  /**
   * Client: quits game
   */
  QUIT_GAME: 'pk_quit',

  /**
   * Player updates tags
   */
  player: {
    MOVE: 'pkp_move',
    SHOOT: 'pkp_shoot'
  }
};

module.exports = Packets;
