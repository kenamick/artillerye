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
  }

};

module.exports = Globals;
