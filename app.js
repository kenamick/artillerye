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
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , SocketIO = require('socket.io');

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
var io = SocketIO(httpServer).of('/game');
io.on('connection', function(socket) {
  console.log('new socket 12');
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function(data) {
    console.log('new event', data);
  });
});
