/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var Terrain = require('../../shared/terrain')
  , Physics = require('../../shared/physics')
  ;

function Entities(game) {
  this.game = game;

  this.physics = null;

  this.entities = [];
};

Entities.prototype = {

  setPhysics: function(config) {
    this.physics = new Physics({
      restitution: config.restitution,
      gravity: config.gravity
    });
    this.physics.addWallTop(0, 0);
    this.physics.addWallBottom(0, this.game.height);
    this.physics.addWallLeft(0, 0);
    this.physics.addWallRight(this.game.width, 0);
  },

  addPlayer: function(x, y) {
    var sprite = this.game.add.sprite(x, y, 'balloon')
      , shape = this.physics.shapes.rect(sprite.width, sprite.height);

    sprite.spirit = this.physics.addBody(x, y, shape, 1, 0);;
    sprite.anchor.set(0.5);
    sprite.inputEnabled = true;

    this.entities.push(sprite);

    return sprite;
  },
  /**
   * Update all entities positions for
   * which a physics body exists
   */
  update: function() {

    this.physics.update();

    for (var i = this.entities.length - 1; i >= 0; i--) {
      var sprite = this.entities[i];
      if (sprite.spirit) {
        sprite.x = sprite.spirit.x;
        sprite.y = sprite.spirit.y;
        sprite.rotation = sprite.spirit.angle;
      }
    }
  },

};


/**
 * Exports
 */

module.exports = function(game) {
  return new Entities(game);
};
