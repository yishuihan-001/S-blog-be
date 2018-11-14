const express = require('express')
const Article = require('../controller/article')
const checkLogin = require('../middlewares/check').checkLogin

const router = express.Router()

router.get('/list/:userId', Article.list)
router.get('/detail/:articleId', Article.detail)
router.post('/create', checkLogin, Article.create)
router.put('/', checkLogin, Article.update)
router.delete('/:articleId', checkLogin, Article.delete)

module.exports = router
