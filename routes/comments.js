const express = require('express')
const Comments = require('../controller/comments')
const checkLogin = require('../middlewares/check').checkLogin

const router = express.Router()

router.post('/', checkLogin, Comments.create)
router.delete('/:commentId', checkLogin, Comments.delete)

module.exports = router
