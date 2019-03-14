
const socket = require('socket.io');
const express = require('express');

const app = express();
const server = app.listen(4000, () => {
  console.log('test');
})
const io = socket(server);

io.on('connection', (client) => {
  console.log('connected');

  client.on('sendData', (value) => {
    console.log('something', value);
    io.sockets.emit('data', value);
  });
});