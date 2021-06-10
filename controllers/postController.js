const Post = require("../models/Post")
const Operations=require("../models/Operations")
const postsCollection = require("../db").db().collection("posts")


exports.getPhotoUploadForm=async function(req,res){
  try{
    let allPosts = await postsCollection.find({ username: req.username}).toArray()
    let photoLinks=allPosts.filter((post)=>{
      if(post.postType=="photo"){
        return post
      }
    }).map((post)=>{
      return post.link
    })
    console.log("Links",photoLinks)
    res.render("photo-upload-form",{
      myActiveConnections:req.myActiveConnections,
      unseenMessages:req.unseenMessages,
      unseenNotifications:req.unseenNotifications,
      photoLinks:photoLinks
    })
  }catch{

  }
}

exports.createPost = function (req, res) {
  if(req.body.postType=="photo"){
    let file = req.files.postFile
    let id=Operations.makeid()
    let filename=id+req.username
    let filePath = "public/images/postPhoto/" + filename + ".jpg"
    req.body.link="/images/postPhoto/" + filename + ".jpg"
    req.body.filePath=filePath
    req.body.file=file
  }
  let post = new Post(req.body, req.username, undefined, req.name)
  post
    .createPost()
    .then(function () {
      req.flash("success", "New post successfully created.")
        req.session.save(() => res.redirect("/user-home"))
    })
    .catch(function (errors) {
      req.flash("errors", errors)
        req.session.save(() => res.redirect("/user-home"))
    })
}

exports.ifPostExists = function (req, res, next) {
  Post.findById(req.params.postId)
    .then(function (post) {
      req.postId = post._id
      req.postUsername=post.username
      next()
    })
    .catch(function () {
      res.render("404")
    })
}
exports.like = function (req, res) {
  let post = new Post(req.body, req.username, req.postId,req.name)
  console.log(req.body, req.postId, req.username)
  post
    .like(req.postUsername)
    .then(function () {
        req.flash("success", "Like added...")
        req.session.save(() => res.redirect("/user-home"))
    })
    .catch(function (errors) {
      req.flash("errors", errors)
        req.session.save(() => res.redirect("/user-home"))
    })
}

exports.disLike = function (req, res) {
  let post = new Post(req.body, req.username, req.postId,req.name)
  console.log(req.body, req.postId, req.username)
  post
    .disLike()
    .then(function () {
        req.flash("success", "Like removed...")
        req.session.save(() => res.redirect("/user-home"))
    })
    .catch(function (errors) {
      req.flash("errors", errors)
        req.session.save(() => res.redirect("/user-home"))
    })
}

exports.commentOnPost = function (req, res) {
  console.log(req.body)
  let post = new Post(req.body, req.username, req.postId, req.name)
  console.log(req.body, req.postId, req.username)
  post
    .commentOnPost(req.postUsername)
    .then(function () {
      req.flash("success", "New comment successfully added.")
      req.session.save(() => res.redirect("/user-home"))
    })
    .catch(function (errors) {
      req.flash("errors", errors)
      req.session.save(() => res.redirect("/user-home"))
    })
}

exports.deletePost = function (req, res) {
  console.log("Post id :", req.postId, req.username)
  Post.deletePost(req.postId, req.username)
    .then(() => {
      req.flash("success", "Post successfully deleted.")
        req.session.save(() => res.redirect(`/profile/${req.username}`))
    })
    .catch((err) => {
      req.flash("errors", err)
      
        req.session.save(() => res.redirect("/user-home"))
      
    })
}
