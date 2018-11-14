const marked = require('marked')
const Mongolass = require('mongolass')
const mongolass = require('../lib/mongo')
const config = require('config-lite')(__dirname)

const Comment = mongolass.model('Comment', {
  author: { type: Mongolass.Types.ObjectId, required: true },
  content: { type: 'string', required: true },
  postId: { type: Mongolass.Types.ObjectId, required: true }
})
Comment.index({ postId: 1, _id: 1 }).exec() // 通过文章 id 获取该文章下所有留言，按留言创建时间升序

Comment.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map(function (comment) {
      comment.content = marked(comment.content)
      return comment
    })
  }
})

// 将 user 设为服务器路径
Comment.plugin('fullImgPath', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.author.avatarPre = config.host + ':' + config.port + '/static/img/'
      return post
    })
  },
  afterFindOne: function (post) {
    if (post) {
      post.author.avatarPre = config.host + ':' + config.port + '/static/img/'
    }
    return post
  }
})

// 去除标签字符串和换行回车符
Comment.plugin('removeSpare', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.content = post.content.replace(/<\/?.+?>/g, '').replace(/[\r\n]/g, '')
      return post
    })
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = post.content.replace(/<\/?.+?>/g, '').replace(/[\r\n]/g, '')
    }
    return post
  }
})

module.exports = Comment
