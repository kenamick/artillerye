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
  , GamePlayer = require('./gameplayer')
  ;

function Entities(game) {
  this.game = game;

  this.physics = null;

  this.spirits = null;

  this.bulletsGroup = null;

  this.entities = [];
};

Entities.prototype = {

  _addBatch: function(batchName, blocks, spriteName) {
    var batch = this.game.add.spriteBatch(this.game, null, batchName);

    for (var i = blocks.length - 1; i >= 0; i--) {
        var sprite = batch.create(blocks[i].x, blocks[i].y, spriteName);
        sprite.spirit = blocks[i];
        sprite.anchor.set(0.5);

        this.entities.push(sprite);
    }
    return batch;
  },

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

  addGround: function(width, height) {
    var blocks = this.spirits.addGround(width, height);
    return this._addBatch('ground', blocks, 'ground64');
  },

  addWater: function(size) {
    var batch = this.game.add.spriteBatch(this.game, null, 'waterb')
      , width = this.game.width / size
      , dy = this.game.height - size / 2;
    for (var i = 0; i < width; i++) {
      var sprite = batch.create(i * size, dy, 'water');
    }
    return batch;
  },

  addPlayer: function(x, y) {
    var sprite = this.game.add.sprite(x, y, 'tank');
    sprite.spirit = this.spirits.addPlayer(x, y, sprite.width, sprite.height);
    sprite.anchor.set(0.5);
    sprite.inputEnabled = true;

    this.entities.push(sprite);

    var player = new GamePlayer(sprite, this);
    return player;
  },

  addBlocks: function(width, height) {
    var blocks = this.spirits.addBlocks(width, height);
    return this._addBatch('ground', blocks, 'box32');
  },

  addBullets: function(amount) {
    var group = this.game.add.group()
      , bullet;

    for(var i = 0; i < amount; i++) {
      bullet = this.game.add.sprite(0, 0, 'bullet');
      group.add(bullet);

      bullet.anchor.set(0.5, 0.5);
      bullet.kill();
    }

    this.bulletsGroup = group;
    return group;
  },

  addBullet: function(spirit) {
    var bullet = this.bulletsGroup.getFirstDead();
    if (!bullet) {
      throw "Bullets not available!"
    }

    bullet.revive();
    bullet.reset(0, 0);
    bullet.rotation = 0;

    bullet.spirit = spirit;
    this.entities.push(bullet);

    return bullet;
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

        if (!sprite.spirit.fixedRotation)
          sprite.rotation = sprite.spirit.angle;
      }
    }

    this.bulletsGroup.forEachAlive(function(bullet) {
      bullet.spirit.alignRotationToVel();
    });

  },

};

/**
 * Exports
 */

module.exports = function(game) {
  return new Entities(game);
};
