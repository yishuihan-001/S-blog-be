const express = require('express')
const User = require('../controller/user')
const checkNotLogin = require('../middlewares/check').checkNotLogin
const checkLogin = require('../middlewares/check').checkLogin

const router = express.Router()

// router.get('/login/:name/:password', checkNotLogin, User.login)
router.post('/login', checkNotLogin, User.login)
router.post('/register', checkNotLogin, User.register)
router.get('/signout', checkLogin, User.signout)
// router.post('/signout', checkLogin, User.signout)
router.get('/info', checkLogin, User.info)

module.exports = router
