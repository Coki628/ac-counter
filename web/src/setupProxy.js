const { createProxyMiddleware } = require('http-proxy-middleware')

// CORS対策のプロキシ(使えるのはローカル実行時のみ)
module.exports = function(app) {
    app.use(
      '/atcoder/atcoder-api/v3',
      createProxyMiddleware({
        target: 'https://kenkoooo.com',
        changeOrigin: true,
      })
    );
    app.use(
      '/graphql',
      createProxyMiddleware({
        target: 'https://leetcode.com',
        changeOrigin: true,
      })
    );
    app.use(
      '/users',
      createProxyMiddleware({
        target: 'https://www.codechef.com',
        changeOrigin: true,
      })
    );
};
