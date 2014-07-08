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

var POWER_RADIUS = _globals.HUD_POWER_BUTTON_RADIUS
  , SHOOT_RADIUS = _globals.HUD_SHOOT_BUTTON_RADIUS;

// list of particle bitmaps
var particlesBM = [];
var ExplosionParticle = function(game, x, y) {
   Phaser.Particle.call(this, game, x, y, game.cache.getBitmapData(
    particlesBM[game.rnd.integerInRange(0, particlesBM.length - 1)]));
};
ExplosionParticle.prototype = Object.create(Phaser.Particle.prototype);
ExplosionParticle.prototype.constructor = ExplosionParticle;


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

  _generateParticleBitmaps: function() {
      var bitmap;

      particlesBM = ['pex01', 'pex02', 'pex03', 'pex04', 'pex05'];

      // http://codepen.io/anon/pen/KjlAq
      bitmap = this.game.add.bitmapData(4, 4);
      bitmap.context.fillStyle = '#555';
      bitmap.context.fillRect(1, 1, 4, 2);
      bitmap.context.fillRect(1, 2, 2, 4);
      this.game.cache.addBitmapData(particlesBM[0], bitmap);

      bitmap = this.game.add.bitmapData(5, 5);
      bitmap.context.fillStyle = '#333';
      bitmap.context.fillRect(1, 1, 4, 2);
      bitmap.context.fillRect(3, 2, 2, 2);
      bitmap.context.fillRect(1, 4, 4, 2);
      this.game.cache.addBitmapData(particlesBM[1], bitmap);

      bitmap = this.game.add.bitmapData(5, 5);
      bitmap.context.fillStyle = '#777';
      bitmap.context.fillRect(1, 1, 3, 2);
      bitmap.context.fillRect(2, 2, 3, 3);
      bitmap.context.fillRect(3, 4, 4, 2);
      this.game.cache.addBitmapData(particlesBM[2], bitmap);

      bitmap = this.game.add.bitmapData(6, 6);
      bitmap.context.fillStyle = '#444';
      bitmap.context.fillRect(1, 1, 6, 6);
      this.game.cache.addBitmapData(particlesBM[3], bitmap);

      bitmap = this.game.add.bitmapData(6, 6);
      bitmap.context.fillStyle = '#333';
      bitmap.context.fillRect(1, 1, 3, 3);
      bitmap.context.fillRect(3, 3, 3, 3);
      this.game.cache.addBitmapData(particlesBM[4], bitmap);
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
      , width = this.game.width / size + 1
      , dy = this.game.height - size / 2;

    for (var i = 0; i < width; i++) {
      var sprite = batch.create(i * size, dy, 'water');
      // each tile moves east, tween repeats
      var tween = this.game.add.tween(sprite).to({x: i * size - _globals.TILE_SIZE},
        3125, Phaser.Easing.Linear.In, true, 0, Number.MAX_VALUE);
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
      _globals.debug('Bullets not available!');
      return;
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

  addExplosions: function() {
    this._generateParticleBitmaps();
    this.explosionsGroup = this.game.add.group();
    return this.explosionsGroup;
  },

  addExplosion: function(x, y) {
    var explosion = this.explosionsGroup.getFirstDead();
    if (!explosion) {
      explosion = this.game.add.sprite(0, 0, 'explosion');
      explosion.anchor.set(0.5, 0.5);

      var animation = explosion.animations.add('boom', [0, 1, 2, 3], 60, false);
      animation.killOnComplete = true;

      this.explosionsGroup.add(explosion);
    }

    explosion.revive();
    explosion.x = x;
    explosion.y = y;
    explosion.angle = this.game.rnd.integerInRange(0, 360);
    explosion.animations.play('boom');
    return explosion;
  },

  addParticleExplosion: function(x, y) {
    var emitter = this.game.add.emitter(x, y, _globals.MAX_PARTICLES);
    emitter.width = _globals.WIDTH_PLAYER;

    emitter.particleClass = ExplosionParticle;
    emitter.makeParticles();

    emitter.bringToTop = true;
    // emitter.setRotation(0, 0);
    // emitter.minParticleSpeed.set(0, 100);
    // emitter.maxParticleSpeed.set(50, 100);
    emitter.setXSpeed(50, 75);
    emitter.setYSpeed(-200, 0);
    // emitter.gravity = 100;
    emitter.start(true, 3000, null, 20);
  },

  setTrajectory: function(sx, sy, dx, dy) {
    if (!this.trajectory.bitmap) {
      this.trajectory.bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
      this.trajectory.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
      this.trajectory.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
      this.trajectory.sprite = this.game.add.image(0, 0, this.trajectory.bitmap);
    }

    this.trajectory.sx = sx;
    this.trajectory.sy = sy;
    this.trajectory.dx = dx;
    this.trajectory.dy = dy;
    this.trajectory.timeOffset = 0;
    this.trajectory.power = 0;
    this.trajectory.powerRadius = 0;
    this.updateTrajectory(_globals.MAX_BULLET_SPEED / 25);

    var phi = Phaser.Math.angleBetween(dx, dy, sx, sy);

    // power surface point
    this.trajectory.pspx = dx + Math.cos(phi) * (POWER_RADIUS);
    this.trajectory.pspy = dy + Math.sin(phi) * (POWER_RADIUS);
    // shoot
    // this.trajectory.shootx = dx + Math.cos(phi) * (POWER_RADIUS + SHOOT_RADIUS);
    // this.trajectory.shooty = dy + Math.sin(phi) * (POWER_RADIUS + SHOOT_RADIUS);
    this.trajectory.shootx = dx;
    this.trajectory.shooty = dy - (POWER_RADIUS + SHOOT_RADIUS);
    // move forward
    this.trajectory.mvfx = dx + (POWER_RADIUS + SHOOT_RADIUS);
    this.trajectory.mvfy = dy;
    // move backward
    this.trajectory.mvbx = dx - (POWER_RADIUS + SHOOT_RADIUS);
    this.trajectory.mvby = dy;

    if (!this.trajectory.sprite.alive) {
      this.trajectory.sprite.revive();
      // clear previous drawing
      this.trajectory.bitmap.context.clearRect(0, 0, this.game.width, this.game.height);
      this.trajectory.bitmap.dirty = true;
    }

    return this.trajectory;
  },

  updateTrajectory: function(value) {
    if (typeof value === 'undefined') {
      this.trajectory.power += 500 * this.game.time.physicsElapsed;
    } else {
      this.trajectory.power = value;
    }
    this.trajectory.power = Math.min(this.trajectory.power, _globals.MAX_BULLET_SPEED);
    this.trajectory.powerRadius = Phaser.Math.mapLinear(this.trajectory.power,
      0, _globals.MAX_BULLET_SPEED, 0, POWER_RADIUS);
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

    // this.physics.update();

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

      trajectory.timeOffset += 1.0 / MARCH_SPEED; //(1000 * MARCH_SPEED / 60);
      if (trajectory.timeOffset >= 1)
        trajectory.timeOffset = 0;

      context.setLineDash([2 + trajectory.timeOffset, 3]);
      context.beginPath();
      context.lineWidth = 1;
      context.moveTo(trajectory.sx, trajectory.sy);
      context.lineTo(trajectory.pspx, trajectory.pspy);
      context.stroke();
      context.closePath();

      // power
      context.beginPath();
      context.arc(trajectory.dx, trajectory.dy, POWER_RADIUS, 0, _globals.math.PI2);
      context.stroke();
      context.closePath();
      context.fillStyle = 'rgba(255, 15, 15, 0.75)';
      context.beginPath();
      context.arc(trajectory.dx, trajectory.dy, trajectory.powerRadius, 0, _globals.math.PI2);
      context.closePath();
      context.fill();

      context.setLineDash([0, 0]);

      // shoot
      context.beginPath();
      context.arc(trajectory.shootx, trajectory.shooty, SHOOT_RADIUS, 0, _globals.math.PI2);
      context.stroke();
      context.closePath();
      // context.strokeStyle = 'rgba(25, 225, 25, 0.5)';
      var radialGradient = context.createRadialGradient(
        trajectory.shootx, trajectory.shooty, SHOOT_RADIUS / 4,
        trajectory.shootx + 10, trajectory.shooty + 10, SHOOT_RADIUS * 2);
      radialGradient.addColorStop(0, "#FF1E1E");
      radialGradient.addColorStop(1, "#0C230C");
      context.fillStyle = radialGradient; //'rgba(25, 225, 25, 0.5)';
      context.beginPath();
      context.arc(trajectory.shootx, trajectory.shooty, SHOOT_RADIUS, 0, _globals.math.PI2);
      context.stroke();
      context.closePath();
      context.fill();
      // movement
      context.fillStyle = 'rgba(110, 210, 0, 0.75)';
      context.beginPath();
      context.arc(trajectory.mvfx, trajectory.mvfy,
        _globals.HUD_MOVE_BUTTON_RADIUS, 0, _globals.math.PI2);
      context.stroke();
      context.closePath();
      context.fill();
      context.fillStyle = 'rgba(248, 210, 0, 0.75)';
      context.beginPath();
      context.arc(trajectory.mvbx, trajectory.mvby,
        _globals.HUD_MOVE_BUTTON_RADIUS, 0, _globals.math.PI2);
      context.stroke();
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
