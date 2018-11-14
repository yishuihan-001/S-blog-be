const mongolass = require('../lib/mongo')

const User = mongolass.model('User', {
  name: { type: 'string', required: true },
  password: { type: 'string', required: true },
  avatar: { type: 'string', required: true },
  gender: { type: 'string', enum: ['m', 'f', 'x'], default: 'x' },
  bio: { type: 'string', required: true }
})
User.createIndex({ name: 1 }, { unique: true }).exec()// 根据用户名找到用户，用户名全局唯一

module.exports = User
