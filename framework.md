## 基本框架搭建

### node.js

> - **node.js** 是一个基于 Chrome V8 引擎的 JavaScript 运行环境
> - **npm（node package manager）** 是 nodejs 的包管理器，用于 node 插件管理

前往[https://nodejs.org/en/download/](https://nodejs.org/en/download/)下载相应的安装包进行安装，这里不做介绍，通过以下命令验证安装：

```bash
$ node -v
$ npm -v
```

由于网络原因，安装`cnpm`：

```bash
$ npm install -g cnpm --registry=https://registry.npm.taobao.org
```



### 前端框架

#### 安装 vue-cli

> **Vue CLI** 是一个基于 Vue.js 进行快速开发的完整系统

```bash
$ cnpm install -g @vue/cli
$ vue -V  # 验证安装
```

#### 安装 webpack

> **Webpack** 是一个前端资源加载/打包工具

```bash
$ cnpm install -g webpack webpack-cli
$ webpack -v  # 验证安装
```

#### 构建前端

创建一个项目文件夹`web-chatroom`：

```bash
$ cd web-chatroom  # 进入项目文件夹
$ vue create client  # 创建前端vue项目
```

在交互界面进行如下配置：

```bash
Vue CLI v4.5.15
? Please pick a preset: Manually select features
? Check the features needed for your project: Choose Vue version, Babel, Router, Vuex, Linter
? Choose a version of Vue.js that you want to start the project with 2.x
? Use history mode for router? (Requires proper server setup for index fallback in production) No
? Pick a linter / formatter config: Standard
? Pick additional lint features: Lint on save
? Where do you prefer placing config for Babel, ESLint, etc.? In dedicated config files
? Save this as a preset for future projects? No
```

成功生成项目后，在目录`client`下执行命令`npm run serve`，浏览器打开`localhost:8080`查看运行效果



### 后端框架

#### 安装 express

```bash
$ cnpm install -g express express-generator
$ express --version  # 验证安装
```

#### 构建后端

```bash
$ cd web-chatroom  # 进入项目文件夹
$ express -e --git server  # 创建后端express项目
$ cd server  # 进入后端文件夹
$ cnpm install  # 安装依赖
```

执行命令`npm start`，浏览器打开`localhost:3000`查看运行效果



### Mongoose

安装依赖：

```bash
$ cd server # 进入后端文件夹
$ cnpm i mongoose -S
```

创建文件`server/database/db.js`：

```js
var mongoose = require('mongoose');
var DB_URL = 'mongodb://localhost:27017/chatroom';

// 链接
mongoose.connect(DB_URL);
var db = mongoose.connection;

// 链接成功
db.on('connected', function() {
  console.log('Mongoose connection open to ' + DB_URL);
});

// 链接异常
db.on('error', function(err) {
  console.log('Mongoose connection error:' + err);
});

// 链接断开
db.on('disconnected', function() {
  console.log('Mongoose connection disconnected');
});

module.exports = mongoose;
```

创建文件`server/database/user_model.js`：

```js
var mongoose = require('./db.js');
var Schema = mongoose.Schema;

// create a model of user
var UserSchema = new Schema({
  username: { type: String },
  password: { type: String },
  phone: { type: String }
});

// export model
var User = module.exports = mongoose.model('User', UserSchema);
```

修改文件`server/routes/index.js`：

```js
var express = require('express');
var router = express.Router();

// get the model of user
var User = require('../database/user_model');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  User.find({
    username: 'test',
    password: '123456'
  }, (err, docs) => {
    if (err) {
      res.render('index', { title: 'error' });
    } else if (docs.length == 0) {
      res.render('index', { title: 'not exist' });
    } else {
      res.render('index', { title: docs[0]['username'] });
    }
  });
});

module.exports = router;
```

重新执行命令`npm start`，浏览器打开`localhost:3000`查看运行效果



### 前后端交互

安装 axios：

```bash
$ cd client
$ cnpm i axios -S
```

创建文件`client/vue.config.js`：

```js
module.exports = {
    devServer: {
        proxy: {
            'api': {
                target: 'http://localhost:3000',  // 接口域名
                changeOrigin: true,               // 是否跨域
                ws: true,                         // 是否代理 websocket
                secure: true,                     // 是否启用 https
                pathRewrite: {                    // 路径重置
                    '^/api': ''
                }
            }
        }
    }
}
```



在文件`client/src/main.js`中引入axios：

```js
// axios
import axios from 'axios'

Vue.prototype.$axios = axios
axios.defaults.baseURL = '/api'
```

修改文件`client/src/views/About.vue`：

```vue
<template>
  <div class="about">
    <h1> {{this.msg}} </h1>
  </div>
</template>

<script>
export default {
  name: 'Test',
  data () {
    return {
      msg: ''
    }
  },
  mounted () {
    this.$axios.get('/users').then((res) => {  // 此请求在server/routes/users.js中已定义
      this.msg = res.data
    })
      .catch((err) => {
        console.log(err)
      })
  }
}
</script>
```

在目录`client`下执行命令`npm run serve`，浏览器打开`localhost:3000/about`查看运行效果

### socket.io

#### 后端

安装依赖：

```bash
$ cd server
$ cnpm i socket.io -S
```

 创建文件`server/routes/chat.js`：

```js
module.exports = function (server) {
  var io = require('socket.io')(server, {
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('client + 1');

    socket.on('sendMsg', (data) => {
      console.log(data);
      socket.emit('sendMsg', {msg: 'from the server'});
      socket.broadcast.emit('sendMsg', {msg: 'from the server to everyone'});
    });

    socket.on('disconnect', function () {
      console.log('clien - 1');
    });
  })
}
```

在文件`server/bin/www`中`var server = http.createServer(app);`后添加：

```js
// socket
var io = require('../routes/chat');
io(server);
```



#### 前端

安装依赖：

```bash
$ cd client
$ cnpm i vue-socket.io -S
```

 在文件`client/src/main.js`中引入：

```js
// socket
import VueSocketio from 'vue-socket.io'

Vue.use(new VueSocketio({
  debug: true,
  connection: 'http://localhost:3000'
}))
```

修改文件`client/src/views/About.vue`为:

```vue
<template>
  <div class="about">
    <h1> {{this.msg}} </h1>
    <button @click="sendSocketMsg">send</button>
  </div>
</template>

<script>
export default {
  name: 'Test',
  data () {
    return {
      msg: ''
    }
  },
  mounted () {
    this.$axios.get('/users').then((res) => {
      this.msg = res.data
    })
      .catch((err) => {
        console.log(err)
      })
  },
  sockets: {
    connect () {
      console.log('socket connected')
    },
    disconnect () {
      console.log('socket disconnected')
    },
    sendMsg (data) {
      console.log(data)
    }
  },
  methods: {
    sendSocketMsg () {
      this.$socket.emit('sendMsg', { msg: 'from the client' })
    }
  }
}
</script>
```

