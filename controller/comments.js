const Res = require('../lib/res')
const CommentModel = require('../models/comments')
const Validator = require('../lib/validator')

class Comments {
  constructor () {
    this.create = this.create.bind(this)
    this.delete = this.delete.bind(this)
  }
  async create (req, res, next) {
    // res.send(Res.Success('创建留言'))
    let author = req.session.user._id
    let { postId, content } = req.fields

    // 校验参数
    try {
      let va = new Validator()
      va.add(content, [{ rule: 'isEmpty', msg: '请填写留言内容' }])
      let vaResult = va.start()
      if (vaResult) {
        throw new Error(vaResult)
      }
    } catch (err) {
      return res.send(Res.Fail(err.message))
    }

    let comment = {
      author: author,
      postId: postId,
      content: content
    }

    try {
      await this.dbCreateComment(comment)
      res.send(Res.Success('留言成功'))
    } catch (err) {
      res.send(Res.Fail(err.message))
    }
  }

  async delete (req, res, next) {
    // res.send(Res.Success('删除留言'))
    let commentId = req.params.commentId
    let author = req.session.user._id

    try {
      let comment = await this.dbGetCommentById(commentId)
      if (!comment) {
        throw new Error('留言不存在')
      }
      // 只能删除自己创建的留言
      if (comment.author.toString() !== author.toString()) {
        throw new Error('没有权限删除留言')
      }
      await this.dbDeleteComment(commentId)
      res.send(Res.Fail('留言删除成功'))
    } catch (err) {
      res.send(Res.Fail(err.message))
    }
  }

  dbCreateComment (comment) {
    return CommentModel.create(comment).exec()
  }

  dbGetCommentById (commentId) {
    return CommentModel.findOne({ _id: commentId }).exec()
  }

  dbDeleteComment (commentId) {
    return CommentModel.deleteOne({ _id: commentId }).exec()
  }
}

module.exports = new Comments()
