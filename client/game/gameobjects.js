/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var Physics = require('../../shared/physics')
  , Spirits = require('../../shared/spirits')
  ;

function Entities(game) {
  this.game = game;

  this.physics = null;

  this.spirits = null;

  this.entities = [];
};

Entities.prototype = {

  setPhysics: function(config) {
    this.physics = new Physics({
      restitution: config.restitution,
      gravity: config.gravity
    });
    this.spirits = new Spirits(this.physics);
  },

  addWalls: function(width, height) {
    this.spirits.addWalls(width, height);
  },

  addPlayer: function(x, y) {
    var sprite = this.game.add.sprite(x, y, 'balloon');
    sprite.spirit = this.spirits.addPlayer(x, y, sprite.width, sprite.height);
    sprite.anchor.set(0.5);
    sprite.inputEnabled = true;

    this.entities.push(sprite);

    return sprite;
  },

  addBlocks: function(width, height) {
    var blocks = this.spirits.addBlocks(width, height)
      , batch = this.game.add.spriteBatch(this.game, null, 'voxels');

    for (var i = blocks.length - 1; i >= 0; i--) {
        var sprite = batch.create(blocks[i].x, blocks[i].y, 'box32');
        sprite.spirit = blocks[i];
        sprite.anchor.set(0.5);

        this.entities.push(sprite);
    }
    return batch;
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
