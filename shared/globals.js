/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var Globals = {

  /**
   * Global constants
   */
  
  PLAYER_SHOOT_DELAY: 300,
  BULLET_SPEED: 400,
  MAX_BULLETS: 20,

  WIDTH_BULLET: 16,
  HEIGHT_BULLET: 10,
  WIDTH_GROUND: 64,
  WIDTH_BLOCK: 32,

  WEIGHT_GROUND: 100,
  WEIGHT_PLAYER: 80,
  WEIGHT_BULLET: 10,
  WEIGHT_BLOCK: 90,

  /**
   * Debugging
   */
  
  enableDebug: true,

  debug: function() {
    if (this.enableDebug) {
      var args = Array.prototype.slice.call(arguments, 0);
      console.log(args);
    }
  },

  error: function() {
    if (this.enableDebug) {
      var args = Array.prototype.slice.call(arguments, 0);
      console.error(args);
    }
  },

  /**
   * Math constants
   */
  
  math: {
    PI:  3.14159265358979,
    PI2: 6.28318530716,
    PI_2: 1.5707963267948966,
    PI_4: 0.3926990817,
    PI3_2: 4.71238898037
  }

};

module.exports = Globals;
