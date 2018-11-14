## 说明

### 用户相关

-1. 注册 **POST** `/blog/user/register`
   Params: name, gender, bio, password, repassword, avatar

-2. 登录 **POST** `/blog/user/login`
   Params: name, password

-3. 登出 **GET** `/blog/user/signout`

### 评论相关

-1. 创建评论 **POST** `/blog/comments`
   Params: postId, content

2. 删除评论 **DELETE** `/blog/comments/:commentsId`
   Params: commentsId

### 文章相关

-1. 获取文章列表 **GET** `/blog/article/list/:userId`
   Params: allin 或者 userId

-2. 获取文章详情 **GET** `/blog/article/detail/:articleId`
   Params: articleId

-3. 创建文章 **POST** `/blog/article/create`
   Params: title, content

-4. 更新文章 **PUT** `/blog/article`
   Params: postId, title, content

-5. 删除文章 **DELETE** `/blog/article/:articleId`
   Params: articleId

> **tip**
> 本 api 中不使用 query 查询字符串传参，谨记！
