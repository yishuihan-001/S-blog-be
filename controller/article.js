const Res = require('../lib/res')
const ArticleModel = require('../models/article')
const CommentModel = require('../models/comments')
const Validator = require('../lib/validator')

class Article {
  constructor () {
    this.list = this.list.bind(this)
    this.detail = this.detail.bind(this)
    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.delete = this.delete.bind(this)
  }

  async list (req, res, next) {
    // res.send(Res.Success('所有文章'))
    try {
      let articleList = await this.dbGetList(req.params.userId)
      res.send(Res.Success(articleList))
    } catch (err) {
      res.send(Res.Fail(err.message))
    }
  }

  async detail (req, res, next) {
    // res.send(Res.Success('文章详情'))
    let postId = req.params.articleId
    try {
      let result = await Promise.all([this.dbGetArticleById(postId), this.dbGetAllCommentsById(postId), this.dbIncPv(postId)])
      let article = result[0]
      let comments = result[1]
      if (!article) {
        throw new Error('该文章不存在')
      }
      res.send(Res.Success({
        article: article,
        comments: comments
      }))
    } catch (err) {
      res.send(Res.Fail(err.message))
    }
  }

  async create (req, res, next) {
    // res.send(Res.Success('创建文章'))
    let author = req.session.user._id
    let { title, content } = req.fields

    // 校验参数
    try {
      let va = new Validator()
      va.add(title, [{ rule: 'isEmpty', msg: '请填写标题' }])
      va.add(content, [{ rule: 'isEmpty', msg: '请填写内容' }])
      let vaResult = va.start()
      if (vaResult) {
        throw new Error(vaResult)
      }
    } catch (err) {
      return res.send(Res.Fail(err.message))
    }

    let post = {
      author: author,
      title: title,
      content: content
    }

    try {
      let result = await this.dbCreate(post)
      post = result.ops[0]
      res.send(Res.Success('创建成功'))
    } catch (err) {
      res.send(Res.Fail(err.message))
    }
  }

  async update (req, res, next) {
    // res.send(Res.Success('更新文章'))
    let { postId, title, content } = req.fields
    let author = req.session.user._id

    try {
      let article = await this.dbGetArticleSimpleById(postId)
      if (!article) {
        throw new Error('该文章不存在')
      }
      if (author.toString() !== article.author._id.toString()) {
        throw new Error('权限不足')
      }
    } catch (err) {
      return res.send(Res.Fail(err.message))
    }

    try {
      let va = new Validator()
      va.add(title, [{ rule: 'isEmpty', msg: '请填写标题' }])
      va.add(content, [{ rule: 'isEmpty', msg: '请填写内容' }])
      let vaResult = va.start()
      if (vaResult) {
        throw new Error(vaResult)
      }
    } catch (err) {
      return res.send(Res.Fail(err.message))
    }

    try {
      await this.dbUpdate(postId, { title: title, content: content })
      res.send(Res.Success('更新成功'))
    } catch (err) {
      res.send(Res.Fail(err.message))
    }
  }

  async delete (req, res, next) {
    // res.send(Res.Success('删除文章'))
    let postId = req.params.articleId
    let author = req.session.user._id

    try {
      let article = await this.dbGetArticleSimpleById(postId)
      if (!article) {
        throw new Error('该文章不存在')
      }
      if (author.toString() !== article.author._id.toString()) {
        throw new Error('权限不足')
      }
    } catch (err) {
      return res.send(Res.Fail(err.message))
    }

    try {
      await this.dbDelete(postId)
      res.send(Res.Success('删除成功'))
    } catch (err) {
      return res.send(Res.Fail(err.message))
    }
  }

  dbGetList (author = 'allin') {
    let query = {}
    if (author !== 'allin') {
      query.author = author
    }
    return ArticleModel.find(query)
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .fullImgPath()
      .removeSpare()
      .exec()
  }

  // 通过文章id获取一篇文章详情
  dbGetArticleById (postId) {
    return ArticleModel
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .addCreatedAt()
      .addCommentsCount()
      // .contentToHtml()
      .fullImgPath()
      // .removeSpare()
      .exec()
  }

  // 通过文章id获取一篇文章概要
  dbGetArticleSimpleById (postId) {
    return ArticleModel
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .fullImgPath()
      .removeSpare()
      .exec()
  }

  // 获取文章下所有留言
  dbGetAllCommentsById (postId) {
    return CommentModel
      .find({ postId: postId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .fullImgPath()
      .removeSpare()
      .exec()
  }

  // 增加pv
  dbIncPv (postId) {
    return ArticleModel
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  }

  // 创建文章
  dbCreate (post) {
    return ArticleModel.create(post).exec()
  }

  // 创建文章
  dbUpdate (postId, data) {
    return ArticleModel.update({ _id: postId }, { $set: data }).exec()
  }

  // 删除文章
  dbDelete (postId) {
    return ArticleModel.deleteOne({ _id: postId })
      .exec()
      .then(function (res) {
        // 文章删除后，再删除该文章下的所有留言
        if (res.result.ok && res.result.n > 0) {
          return CommentModel.deleteMany({ postId: postId }).exec()
        }
      })
  }
}

module.exports = new Article()
