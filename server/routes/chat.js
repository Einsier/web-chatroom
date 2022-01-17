module.exports = function (server) {
  var io = require('socket.io')(server, {
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true
    }
  });
  
  let count = 0  // 当前群聊用户数量
  let users = []  // 当前群聊用户

  io.on('connection', (socket) => {
    count++
    console.log('user connected')
    
    socket.on('login', (data) => {
      socket.username = data
      console.log(`用户【${data}】加入了聊天室`)
      const user = users.find(item => item === data)
      if (user) {
        socket.emit('loginError')
        console.log(user)
      }else {
        users.push(data)
        console.log(users)
        io.sockets.emit('user_enter', `用户【${data}】加入了聊天室`)
        io.sockets.emit('count_users', users)  // 更新当前用户
      }
    })

    socket.on('send_msg', (data) => {
      console.log(`收到客户端的消息：${data}`)
      io.sockets.emit('broadcast_msg', {  // 向所有在线用户发消息
        username: data.username,
        input: data.input,
        time: new Date().toLocaleString()
      })
    })

    socket.on('disconnect', () => {
      let index = users.findIndex(item => item === socket.username)
      users.splice(index, 1)
      console.log('user disconnected')
      io.sockets.emit('user_leave', `用户【${socket.username}】离开了聊天室`)
      io.sockets.emit('count_users', users)
    });
  })
}