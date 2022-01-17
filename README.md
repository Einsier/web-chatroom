## vue+express+mongodb+socket.io实现简易聊天室

### 运行

```bash
$ cd server
$ cnpm i
$ npm start  # 启动后台服务

$ cd client
$ cnpm i
$ npm run serve  # 启动前端
```

> 前期基本框架搭建流程：[https://github.com/Einsier/web-chatroom/blob/main/framework.md](https://github.com/Einsier/web-chatroom/blob/main/framework.md)

### 项目简介

1. **前端框架：Vue.js** —— Vue.js 是一套构建用户界面的渐进式框架。与其他重量级框架不同的是，Vue采用自底向上增量开发的设计。Vue 的核心库只关注视图层，并且非常容易学习，非常容易与其它库或已有项目整合。另一方面，Vue 完全有能力驱动采用单文件组件和Vue生态系统支持的库开发的复杂单页应用。
2. **后端框架：Express** —— Express 是一个保持最小规模的灵活的 Node.js Web 应用程序开发框架，为 Web 和移动应用程序提供一组强大的功能。
3. **数据库：MongoDB** —— MongoDB 是一个基于分布式文件存储的NoSQL数据库。在本项目中主要用来储存用户信息。
4. **通信：Socket.IO** —— 本项目主要使用 socket.io 来实现聊天功能。



### 页面展示

![](https://gitee.com/einsier/pics-bed/blob/master/pics/20220117210252.png)



![](https://gitee.com/einsier/pics-bed/raw/master/pics/20220117205230.png)



![](https://gitee.com/einsier/pics-bed/raw/master/pics/20220117205235.png)



### 具体实现

项目地址：[https://github.com/Einsier/web-chatroom](https://github.com/Einsier/web-chatroom)

#### 用户登录注册（mongodb）

```js
/* login */
router.get('/login', function(req, res, next) {
  User.find({
    username: req.query.username,
    password: req.query.password
  }, (err, docs) => {
    if (err) {
      res.send({ success: false, message: '系统错误！' });
    } else if (docs.length == 0) {
      res.send({ success: false, message: '此用户不存在！' });
    } else {
      res.send({ data: docs[0], success: true, message: '登录成功！' });
    }
  });
});

/* register */
router.post('/register', function(req, res, next) {
  User.find({
    username: req.query.username
  }, (err, docs) => {
    if (err) {
      res.send({success: false, message: '系统错误！' });
    } else if (docs.length == 0) {
      new User({
        username: req.query.username,
        password: req.query.password,
        phone: req.query.password
      }).save((err) => {
        if (err) {
          res.send({ success: false, message: '注册失败！' });
        } else {
          res.send({ success: true, message: '注册成功！' });
        }
      });
    } else {
      res.send({ success: false, message: '此用户已存在，请登录！' });
    }
  });
});
```



#### 后台聊天相关

```js
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
```



#### 前端-登录

```js
      this.$axios.get('/login', { params: params })
        .then(function (res) {
          if (res.data.success) {
            _this.$router.push({ path: `/chat/${username}` })
            _this.$socket.emit('login', _this.loginForm.username)  // 向后台通知有用户登录
          } else {
            _this.$message.error(res.data.message)
          }
        })
        .catch(function (err) {
          console.log(err)
        })
```

#### 前端-聊天

```js
  sockets: {
    connect () {

    },

    disconnect () {

    },
    user_enter (data) {
      this.chatHistory.push(data)
      localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory))
    },
    user_leave (data) {
      this.chatHistory.push(data)
      localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory))
    },
    count_users (data) {
      this.count = data.length
      this.userList = data
    },
    broadcast_msg (data) {
      this.chatHistory.push(data)
      console.log(this.chatHistory)
      localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory))
    }
  },

  methods: {
    sendMsg () {
      if (this.input.trim() === '') {
        return
      }
      console.log(this.input)
      this.$socket.emit('send_msg', {  // 通知后台广播消息
        username: this.currentUser,
        input: this.input.trim()
      })
      this.input = ''
    },
    /* ...省略部分...  */
  }
}
```
