// socket.io 中namespace 和 room的概念

// * 1.namespace和room的概念是用来同一个服务端socket多路复用的
//   socket会属于某一个room，如果没有指定，那么会有一个default的room；这个room又会属于某个namespace，如果没有指定，那么就是默认的namespace /


// * 2.socketio是如何广播的
//   广播的时候是以namespace为单位的，如果只想广播给某个room，那就需要另外指定room的名字; 

//   socket.broadcast.emit('message', "some messages")                 （广播给跟socket同一个namespace下面的所有客户端）
//   socket.broadcast.to('chat).emit('message', "some messages")       （广播给跟socket同一个namespace下面的，名字为chat的room里的除自己以外的客户端） 

// * 3.socket（不包括自己）与socketio(包括自己)
//   如果是socket开头的，那么namespace已经指定，只能修改room。如果是socketio开头的，那么可以指定namesapce和room

//   socketio.send('some messages'）                                    （广播给默认namespace "/" 和默认room "default" 下的所有客户端）            
//   socketio.of('/private').send('some messages')                      （广播给默认namespace "private" 下的所有客户端）           
//   socketio.of('/private').in('chat').send('some messages')           （广播给默认namespace "private" 和 room "chat" 下的所有客户端）


const socketio = require('socket.io');
let io;
let guestNumber = 1;
let nickNames = {};
let nameUsed = [];
let currentRoom = {};


exports.listen = function (server) {
  io = socketio(server)
  io.on('connection', socket => {
    assignGuestName(socket)
    joinRoom(socket, 'Lobby')
    handleMessageBroadcasting(socket)
    // showLog()
  })
}

function showLog() {
  console.log(guestNumber)
  console.log(nickNames)
  console.log(nameUsed)
}


// 分配名称
// socket.id会为每一个连接分配一个id，为每个连接分配一个用户名
// 播报命名结果与推入已使用用户名

function assignGuestName(socket) {
  let name = 'Guest' + guestNumber;
  nickNames[socket.id] = name;
  socket.emit('nameResult', {
    success: true,
    name: name
  })
  nameUsed.push(name);
  guestNumber = guestNumber + 1
}

// 加入房间
// 为连接分配房间，并对房间内用户发送广播，告知新用户的加入
// 并从新拼接当前房间内的用户列表

function joinRoom(socket, room) {

  // 加入房间
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('joinResult', { room: room });

  // 发出用户进入的广播
  socket.broadcast.to(room).emit('message', {
    text: nickNames[socket.id] + '你加入了房间' + room + '.'
  })

  // 获取客户端列表
  io.clients((error, usersInRoom) => {
    if (error) throw error;
    // 获取房间中的人名
    if (usersInRoom.length > 1) {
      let usersInRoomSummary = '当前在房间' + room + '中有以下访客:';
      usersInRoom.forEach(userSocketId => {
        usersInRoomSummary += nickNames[userSocketId];
        usersInRoomSummary += '.'
      })
      socket.emit('message', { text: usersInRoomSummary })
    }
  });

}


// 处理用户发送信息的功能

function handleMessageBroadcasting(socket) {
  socket.on('message', (req) => {
    socket.broadcast.to(req.room).emit('message', {
      text: nickNames[socket.id] + ':' + req.text
    })
  })
}