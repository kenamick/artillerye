/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    var style1 = { font: '65px Arial', fill: '#131313', align: 'center'}
      , style2 = { font: '18px Arial', fill: '#A1A1A1', align: 'center'}
      , style22 = { font: '18px Arial', fill: '#131313', align: 'center'}
      , style3 = { font: '14px Arial', fill: '#A1A1A1', align: 'center'}
      , text;

    this.game.stage.backgroundColor = '#ffffff';

    // this.sprite = this.game.add.sprite(this.game.world.centerX, 138, 'bags');
    // this.sprite.angle = 115;
    // this.game.add.tween(this.sprite).to({angle: 160}, 2000, Phaser.Easing.Linear.NONE, true, 0, 5000, true);
    // this.sprite.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(this.game.world.centerX, 140, 'Artillerye', style1);
    text.setShadow(3, 3, '#A1A1A1', 5);
    text.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(this.game.world.centerX, 200, 'by Dvubuz Games', style2);
    text.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(this.game.world.centerX, 280, 'Mouse click or tap anywhere on the screen to aim.', style2);
    text.anchor.setTo(0.5, 0.5);
    text = this.game.add.text(this.game.world.centerX, 310, 'Hold mouse button or tap for magnitude.', style2);
    text.anchor.setTo(0.5, 0.5);
    text = this.game.add.text(this.game.world.centerX, 340, 'Press \'Enter\' to chat.', style2);
    text.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(this.game.world.centerX, 400, 'Note: There seem to be some gfx issues with Firefox atm. :(', style2);
    text.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(this.game.world.centerX, 455, 'Click anywhere to start', style22);
    text.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(25, 580, 'Coding & Sfx by Petar Petrov', style3);
    text = this.game.add.text(25, 600, 'Backdrop art by Stremena Tuzsuzova', style3);
  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};

module.exports = Menu;
