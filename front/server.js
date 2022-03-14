// cross domain
const express = require('express');
const next = require('next');
const  { createProxyMiddleware }  = require('http-proxy-middleware');
const devProxy = {
  '/api': {
      target: 'http://localhost:8080/',
      pathRewrite: {
          '^/api': '/api'
      },
      changeOrigin: true
  }
}

const port = parseInt(process.env.NEXT_PUBLIC_PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({
  dev
})
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
      const server = express()

      if (dev && devProxy) {
          Object.keys(devProxy).forEach(function(context) {
              server.use(createProxyMiddleware(context, devProxy[context]))
          })
      }

      server.all('*', (req, res) => {
          handle(req, res)
      })

      server.listen(port, err => {
          if (err) {
              throw err
          }
          console.log(`> Ready on http://localhost:${port}`)
      })
  })
  .catch(err => {
      console.log(err)
  })