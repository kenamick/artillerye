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
   * Client: Ping to server
   * Server: Reply to client
   */
  PING: 'pi',
  /**
   * Client: Send chat message to server
   * Server: Publish chat message
   */
  SEND_CHAT_MSG: 'cm',
  /**
   * Client: conneted to server
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
   * Server: Send game state update to player(s)
   */
  UPDATE_GAME_STATE: 'pk_ugs',
  /**
   * Client: Player moves on screen
   */
  PLAYER_MOVE: 'pkp_move',
  /**
   * Client: Player fires cannon
   */
  PLAYER_SHOOT: 'pkp_shoot',
  /**
   * Server: Player hit by bullet
   */
  PLAYER_HIT: 'pk_plrhit',
  /**
   * Client: quits game
   */
  QUIT_GAME: 'pk_quit',

};

module.exports = Packets;
