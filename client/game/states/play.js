
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
      var terrain = this.game.add.sprite(gw/2, gh - 50 + 50/2, this.createTerrain());

      // create physics body for this sprite
      this.game.physics.p2.enable(terrain, true);
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

    createTerrain: function() {

      var gw = this.game.width;
      var gh = this.game.height;

      var bmd = this.game.add.bitmapData(gw, 50);

      bmd.ctx.beginPath();
      bmd.ctx.rect(0, 0, gw, 50);
      bmd.ctx.fillStyle = '#ff0000';
      bmd.ctx.fill();
      return bmd;

      var terrainPts = [];
      var amp = 1;
      var baseY = 270;

      for(var i = 0; i < gw; i++) {
        amp += 0.5;
        var pt = {
          x: i,
          y: baseY
          //amp * Math.sin(i * Math.PI / 180.0)
        };
        terrainPts.push(pt);
      }

      var graphics = this.game.add.graphics(0, 0);

      // set a fill and line style
      graphics.beginFill(0xFF3300);
      graphics.lineStyle(2, 0xffd900, 1);
      // graphics.strokeStyle('rgb(0,255,255)');

      graphics.moveTo(0, baseY);

      for(var i = 0; i < gw; i++) {
        var p = terrainPts[i];
        // draw a shape
        // console.log('line to ', p.x, p.y);
        graphics.lineTo(p.x, p.y);
      }
      graphics.lineTo(gw, gh);
      graphics.lineTo(0, gh);
      graphics.lineTo(0, baseY);
      graphics.endFill();

      return graphics;
    }

  };

  module.exports = Play;
