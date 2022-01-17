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