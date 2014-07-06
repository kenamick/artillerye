/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var _globals = require('../../shared/globals')
  , Physics = require('../../shared/physics')()
  , Spirits = require('../../shared/spirits')
  , GamePlayer = require('./gameplayer')
  ;

function Factory(game) {
  this.game = game;
  this.physics = null;
  this.spirits = null;

  // bullets sprite batch
  this.bulletsGroup = null;
  // sprite entities that need updating
  this.entities = [];
  // player shoot trajectory
  this.trajectory = {};

};

Factory.prototype = {

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

  initPhysics: function(config) {
    this.physics = Physics.create({
      restitution: config.restitution,
      gravity: config.gravity
    });
    this.spirits = Spirits(this.physics);
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

    spirit.parent = bullet;
    bullet.spirit = spirit;
    this.entities.push(bullet);

    return bullet;
  },

  removeBullet: function(spirit) {
    var bullet = spirit.parent;
    this.spirits.remove(spirit);
    bullet.kill();
  },

  setTrajectory: function(sx, sy, dx, dy) {
    if (!this.trajectory.bitmap) {
      this.trajectory.bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
      this.trajectory.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
      this.trajectory.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
      this.trajectory.sprite = this.game.add.image(0, 0, this.trajectory.bitmap);
    }

    if (!this.trajectory.sprite.alive) {
      this.trajectory.sprite.revive();
    }

    this.trajectory.sx = sx;
    this.trajectory.sy = sy;
    this.trajectory.dx = dx;
    this.trajectory.dy = dy;
    this.trajectory.timeOffset = 0;

    return this.trajectory;
  },

  removeTrajectory: function() {
    if (this.trajectory) {
      this.trajectory.sprite.kill();
    }
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

    /**
     * Draw trajectory routines
     */


    if (this.trajectory.sprite && this.trajectory.sprite.alive) {
      var trajectory = this.trajectory;
      var context = trajectory.bitmap.context;

      context.clearRect(0, 0, this.game.width, this.game.height);
      context.fillStyle = 'rgba(255, 255, 255, 0.5)';

      var MARCH_SPEED = 40;
      var RADIUS = 40;

      trajectory.timeOffset += 1.0 / MARCH_SPEED; //(1000 * MARCH_SPEED / 60);
      if (trajectory.timeOffset >= 1)
        trajectory.timeOffset = 0;

      var phi = Phaser.Math.angleBetween(trajectory.dx, trajectory.dy,
        trajectory.sx, trajectory.sy);
      var ddx = trajectory.dx + Math.cos(phi) * RADIUS;
      var ddy = trajectory.dy + Math.sin(phi) * RADIUS;

      context.setLineDash([2 + trajectory.timeOffset, 3]);
      context.beginPath();
      context.lineWidth = 1;
      context.moveTo(trajectory.sx, trajectory.sy);
      context.lineTo(ddx, ddy);
      context.stroke();
      context.closePath();

      context.setLineDash([0, 0]);
      context.beginPath();
      context.arc(trajectory.dx, trajectory.dy, RADIUS, 0, _globals.math.PI2);
      context.stroke();
      context.closePath();

      context.beginPath();
      context.arc(trajectory.dx, trajectory. dy, RADIUS - 15, 0, _globals.math.PI2);
      context.closePath();
      context.fill();

      trajectory.bitmap.dirty = true;
    }

  },

};

/**
 * Exports
 */

module.exports = function(game) {
  return new Factory(game);
};
