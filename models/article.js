const marked = require('marked')
const CommentModel = require('./comments')
const Mongolass = require('mongolass')
const mongolass = require('../lib/mongo')
const config = require('config-lite')(__dirname)

// 同步使用 highlight.js 转换代码
// marked.setOptions({
//   highlight: function (code) {
//     return require('highlight.js').highlightAuto(code).value
//   }
// })

const Article = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId, required: true },
  title: { type: 'string', required: true },
  content: { type: 'string', required: true },
  pv: { type: 'number', default: 0 }
})
Article.index({ author: 1, _id: -1 }).exec() // 按创建时间降序查看用户的文章列表

// 给 post 添加留言数 commentsCount
Article.plugin('addCommentsCount', {
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post) {
      return CommentModel.count({ postId: post._id }).exec().then(function (commentsCount) {
        post.commentsCount = commentsCount
        return post
      })
    }))
  },
  afterFindOne: function (post) {
    if (post) {
      return CommentModel.count({ postId: post._id }).exec().then(function (count) {
        post.commentsCount = count
        return post
      })
    }
    return post
  }
})

// 将 post 的 content 从 markdown 转换成 html
Article.plugin('contentToHtml', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.content = marked(post.content)
      return post
    })
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = marked(post.content.toString())
    }
    return post
  }
})

// 将 user 设为服务器路径
Article.plugin('fullImgPath', {
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
Article.plugin('removeSpare', {
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

module.exports = Article
