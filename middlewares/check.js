const Res = require('../lib/res')

module.exports = {
  checkLogin (req, res, next) {
    // console.log('1-start')
    // console.log(req.session)
    // console.log('1-end')
    if (!req.session.user) {
      return res.send(Res.Fail('您还没有登录'))
    }
    next()
  },

  checkNotLogin (req, res, next) {
    // if (req.session.user) {
    //   return res.send(Res.Fail('您已登录，请勿重复登录')) // 只能登录一位用户，不会发生session覆盖
    // }
    // 允许一个浏览器登录针对此网站登录多个账户，但会发生session覆盖，以最后一个登录用户为准
    next()
  }
}
