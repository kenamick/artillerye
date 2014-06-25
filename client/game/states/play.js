/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

function Play() {}

Play.prototype = {

  create: function() {

    var Terrain = require('../../../shared/terrain');
    var gw = this.game.width;
    var gh = this.game.height;

    // enable P2 physics
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.p2.restitution = 0.05;
    this.game.physics.p2.gravity.y = 500;

    // add terrain
    var hh = 570;
    var polyTerrain = Terrain.create(gw, hh);
    var terrainBM = this.createTerrain(gw, hh, polyTerrain);
    this.terrainBM = terrainBM;

    var terrain = this.game.add.sprite(0, gh - hh, terrainBM);
    this.terrain = terrain;

    this.terrain.inputEnabled = true;
    this.terrain.events.onInputDown.add(this.shootListener, this);

    // create physics body for this sprite
    // this.game.physics.p2.enable(terrain, true);
    // terrain.anchor.set(0, 0);
    // terrain.body.static = true;
    // terrain.body.clearShapes();
    // terrain.body.addPolygon({
    //   'skipSimpleCheck': true,
    //   'removeCollinearPoints': true
    // }, polyTerrain);

    // terrain.body.x = gw / 2;
    // terrain.body.y = gh - hh + 50;

    // ---------------------------
    //TODO: use http://schteppe.github.io/p2.js/demos/heightfield.html
    // var data = [];
    // for (var i = 0; i < polyTerrain.length; i++) {
    //   data.push(polyTerrain[i][1]);
    // }
    // var heightfieldShape = new p2.Heightfield(data, {
    //   'minValue': -1.0,
    //   'maxValue': 1.0,
    //   'elementWidth': 0.1
    // });
    // // var heightfield = this.game.physics.p2.addBody(0, 0, 0, false, {});
    // var heightfield = new p2.Body({
    //       position:[-5,-1]
    //   });
    // heightfield.addShape(heightfieldShape);
    // this.game.physics.p2.addBody(heightfield);

    // add game tank sprite
    this.sprite = this.game.add.sprite(gw/2, gh/2, 'tank');
    this.sprite.inputEnabled = true;

    this.game.physics.p2.enable([ this.sprite ], true);

    this.sprite.body.collideWorldBounds = true;
    this.sprite.body.velocity.x = this.game.rnd.integerInRange(-500,500);
    this.sprite.body.velocity.y = this.game.rnd.integerInRange(-500,500);

    this.sprite.events.onInputDown.add(this.clickListener, this);



    this.game.input.onDown.add(this.click, this);

  },

  update: function() {

  },

  click: function(pointer) {
    // var bodies = this.game.physics.p2.hitTest(pointer.position, [ this.terrain ]);
    // if (bodies.length > 0) {
    //   var dx = this.game.input.x - this.terrain.x;
    //   var dy = this.game.input.y - this.terrain.y;

    //   console.log('opaa ', dx, dy);

    //   var ctx = this.terrainBM.context;
    //   ctx.beginPath();
    //   ctx.arc(dx, dy, 20, 0, 2 * Math.PI, false);
    //   ctx.fillStyle = '#0F0F0F';
    //   ctx.fill();

    //   //  Because we're changing the context manually, we need to tell Phaser the texture is dirty.
    //   //  You only need to do this in WebGL mode. In Canvas it's not needed.
    //   this.terrainBM.dirty = true;
    // }
  },

  clickListener: function() {
    this.game.state.start('gameover');
  },

  shootListener: function() {
    var dx = this.game.input.x - this.terrain.x;
    var dy = this.game.input.y - this.terrain.y;
    var ctx = this.terrainBM.context;
    ctx.beginPath();
    ctx.arc(dx, dy, 20, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#000';
    ctx.fill();
    //  Because we're changing the context manually, we need to tell Phaser the texture is dirty.
    //  You only need to do this in WebGL mode. In Canvas it's not needed.
    this.terrainBM.dirty = true;
  },

  createTerrain: function(width, height, poly) {
    var bmd = this.game.add.bitmapData(width, height);
    bmd.ctx.beginPath();

    // bmd.ctx.beginPath();
    // bmd.ctx.rect(0, 0, width, height);
    // bmd.ctx.fillStyle = '#ff0000';
    // bmd.ctx.fill();
    // return bmd;

    bmd.ctx.moveTo(poly[0][0], poly[0][1]);

    for(var i = 0, count = poly.length; i < count; i++) {
      var p = poly[i];
      bmd.ctx.lineTo(p[0], p[1]);
      // console.log('line to ', p);
    }
    // bmd.ctx.lineTo(p[0], height);
    // bmd.ctx.lineTo(0, height);
    // bmd.ctx.lineTo(0, 0);

    bmd.ctx.fillStyle = '#ff0000';
    bmd.ctx.fill();

    return bmd;
  }

};

module.exports = Play;
