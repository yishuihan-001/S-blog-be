module.exports = {
  host: 'http://127.0.0.1',
  port: 9000,
  session: {
    secret: 'myblog',
    key: 'myblog',
    maxAge: 3600000
  },
  mongodb: 'mongodb://localhost:27017/myblog'
}
