const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const Res = require('../lib/res')
const UserModel = require('../models/users')
const Validator = require('../lib/validator')

class User {
  constructor () {
    this.register = this.register.bind(this)
    this.login = this.login.bind(this)
  }

  async login (req, res, next) {
    // res.send(Res.Success('登录成功'))
    let { name, password } = req.fields
    // let { name, password } = req.params
    // console.log(req.fields)
    // console.log(req.query.name)
    // console.log(req.query.password)
    // console.log(req.params)

    // 校验参数
    try {
      let va = new Validator()
      va.add(name, [{ rule: 'isEmpty', msg: '姓名不能为空' }])
      va.add(password, [{ rule: 'isEmpty', msg: '密码不能为空' }])
      let vaResult = va.start()
      if (vaResult) {
        throw new Error(vaResult)
      }
    } catch (err) {
      return res.send(Res.Fail(err.message))
    }

    try {
      let user = await this.dbFindUser(name)
      if (!user) {
        throw new Error('该用户不存在')
      }
      // 检查密码是否匹配
      if (sha1(password) !== user.password) {
        throw new Error('密码错误')
      }
      // 用户信息写入 session
      delete user.password
      req.session.user = user
      res.send(Res.Success('登录成功'))
    } catch (err) {
      res.send(Res.Fail(err.message))
    }
  }

  async register (req, res, next) {
    // res.send(Res.Success('注册成功'))
    let { name, gender, bio, password, repassword } = req.fields
    let avatar = ''

    // 校验参数
    try {
      let va = new Validator()
      va.add(name, [{ rule: 'isEmpty', msg: '姓名不能为空' }, { rule: 'maxLength:10', msg: '姓名请限制在 1-10 个字符' }])
      va.add(gender, [{ rule: 'isEmpty', msg: '性别不能为空' }, { rule: 'enum:m&f&x', msg: '性别只能是 m、f 或 x' }])
      va.add(bio, [{ rule: 'isEmpty', msg: '个人描述不能为空' }, { rule: 'maxLength:30', msg: '个人描述请限制在 1-30 个字符' }])
      va.add(password, [{ rule: 'isEmpty', msg: '密码不能为空' }, { rule: 'minLength:6', msg: '密码至少 6 个字符' }])
      va.add(repassword, [{ rule: 'isEmpty', msg: '确认密码不能为空' }, { rule: 'equal:' + password, msg: '两次输入密码不一致' }])
      let vaResult = va.start()
      if (vaResult) {
        throw new Error(vaResult)
      }
      if (!req.files.avatar || !req.files.avatar.name) {
        throw new Error('缺少头像')
      }
      avatar = req.files.avatar.path.split(path.sep).pop()
    } catch (err) {
      // 注册失败，异步删除上传的头像
      avatar && fs.unlink(req.files.avatar.path)
      return res.send(Res.Fail(err.message))
    }

    // 明文密码加密
    password = sha1(password)

    // 待写入数据库的用户信息
    let user = {
      name: name,
      password: password,
      gender: gender,
      bio: bio,
      avatar: avatar
    }

    // 用户信息写入数据库
    try {
      // user = await UserModel.create(user).exec()
      user = await this.dbRegisterUser(user)
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = user.ops[0]
      // 删除密码这种敏感信息，将用户信息存入 session
      delete user.password
      req.session.user = user
      res.send(Res.Success('注册成功'))
    } catch (err) {
      // 注册失败，异步删除上传的头像
      fs.unlink(req.files.avatar.path)
      // 用户名被占用则跳回注册页，而不是错误页
      if (err.message.match('duplicate key')) {
        res.send(Res.Fail('用户名已被占用'))
      } else {
        res.send(Res.Fail('DATABASE_ERROR'))
      }
    }
  }

  signout (req, res, next) {
    req.session.user = null
    res.send(Res.Success('退出成功'))
  }

  dbRegisterUser (user) {
    return UserModel.create(user).exec()
  }

  dbFindUser (name) {
    return UserModel.findOne({ name: name }).addCreatedAt().exec()
  }

  info (req, res, next) {
    res.send(Res.Success(req.session.user))
  }
}

module.exports = new User()
