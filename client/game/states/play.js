
  'use strict';
  function Play() {}
  Play.prototype = {

    create: function() {

      var gw = this.game.width;
      var gh = this.game.height;

      // enable P2 physics
      this.game.physics.startSystem(Phaser.Physics.P2JS);
      this.game.physics.p2.restitution = 0.2;
      this.game.physics.p2.gravity.y = 300;

      // add terrain
      var polyTerrain = this.createTerrainPoly(gw, 70);
      var terrain = this.game.add.sprite(gw/2, gh - 70 + 70/2,
        this.createTerrain(gw, 70, polyTerrain));

      // create physics body for this sprite
      this.game.physics.p2.enable(terrain, true);

      //TODO: use http://schteppe.github.io/p2.js/demos/heightfield.html
      terrain.body.clearShapes();
      terrain.body.addPolygon({
        'skipSimpleCheck': true,
        'removeCollinearPoints': true
      }, polyTerrain);

      // terrain.anchor.setTo(0, 0);
      terrain.body.static = true;
      // terrain.body.collideWorldBounds = true;
      // terrain.body.allowGravity = false;

      // add game tank sprite
      this.sprite = this.game.add.sprite(gw/2, gh/2, 'tank');
      this.sprite.inputEnabled = true;

      this.game.physics.p2.enable([ this.sprite ], true);

      this.sprite.body.collideWorldBounds = true;
      this.sprite.body.velocity.x = this.game.rnd.integerInRange(-500,500);
      this.sprite.body.velocity.y = this.game.rnd.integerInRange(-500,500);

      this.sprite.events.onInputDown.add(this.clickListener, this);
    },

    update: function() {

    },

    clickListener: function() {
      this.game.state.start('gameover');
    },

    createTerrainPoly: function(width, height) {
      var poly = []
        , amp = 1
        , amps = 0.2
        , baseY = height / 2;

      for(var i = 0; i < width; i+=10) {
        var pt = [
          i,
          baseY + amp * Math.sin(i * Math.PI / 180.0)
        ];
        poly.push(pt);

        if (amp >= height / 2)
          amps = -amps;

        amp += amps;
      }

      poly.push([pt[0], height]);
      poly.push([0, height]);
      poly.push([0, baseY]);

      return poly;
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
        console.log('line to ', p);
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
