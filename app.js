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
  , colors = require('colors')
  , routes = require('./server')
  , user = require('./server/user')
  , _globals = require('./shared/globals')
  , packets = require('./shared/packets')
  , GameProc = require('./server/gameproc');


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
  app.use(express.static(path.join(__dirname, 'client')));
  app.use(express.static(path.join(path.join(__dirname, 'client'), 'dist')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// web routes

app.get('/be', routes.index);
app.get('/be/users', user.list);

// start http server

var httpServer = http.createServer(app).listen(app.get('port'), function(){
  console.log('❤❤❤ Artillerye ❤❤❤ '.blue.bold);
  console.log('Server listening on port ' + app.get('port'));
});

// socket.io

var gamesList = [];
var io = SocketIO(httpServer).of('/loosecannon');

/**
 * Send a packet. Compress & serialize, if needed.
 */
var send = function(socket, packet, data) {
  if (typeof socket === 'string') {
    console.log('emit packet to room', socket, packet);
    io.to(socket).emit(packet, data);
  } else {
    if (packet !== packets.PING) {
      console.log('sending packet', packet);
    }
    socket.emit(packet, data);
  }
};

io.on('connection', function(socket) {
  _globals.debug('Socket connected.');

  // send player some server info
  send(socket, packets.CONNECTED, {
    server: {
      name: 'Mindfields',
      ver: '0.0.0', // TODO: this is important!
      games: gamesList.length
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
      var game = new GameProc(send);
      game.initGame();
      game.joinClient(socket);
      gamesList.push(game);
    }
  }

});
