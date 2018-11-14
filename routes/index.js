
const user = require('./user')
const comments = require('./comments')
const article = require('./article')

module.exports = function (app) {
  app.get('/blog/', function (req, res) {
    res.redirect('/article')
  })
  app.use('/blog/user', user)
  app.use('/blog/comments', comments)
  app.use('/blog/article', article)
}
