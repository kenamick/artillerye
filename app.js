/**
 * Artillerye
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * This work is licensed under a Creative Commons Attribution-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nd/4.0/.
 */

'use strict';

var express = require('express')
  , http = require('http')
  , path = require('path')
  , SocketIO = require('socket.io')
  , routes = require('./routes')
  , user = require('./routes/user')
  , _globals = require('./shared/globals')
  , packets = require('./shared/packets')
  , GameProc = require('./shared/gameproc');


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  // app.set('views', __dirname + '/views');
  // app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(path.join(__dirname, 'client'), 'dist')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// web routes
app.get('/be', routes.index);
app.get('/be/users', user.list);

var httpServer = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// socket.io

var gamesList = [];
var io = SocketIO(httpServer).of('/game');

io.on('connection', function(socket) {
  _globals.debug('Socket connected.');

  // send player some server info
  socket.emit(packets.CONNECTED, {
    server: {
      name: 'Mindfields'
    }
  });

  // search for free game
  var foundGame = false;

  for (var i = 0, count = gamesList.length; i < count; i++) {
    if (!gamesList[i].isFull()) {
      gamesList[i].joinClient(socket);
      foundGame = true;
      break;
    }
  }

  if (!foundGame) {
    /**
     * Create new game
     */
    if (gamesList.length < _globals.MAX_GAMES) {
      var game = new GameProc();
      game.initGame();
      game.joinClient(socket);
      gamesList.push(game);
    }
  }

});
