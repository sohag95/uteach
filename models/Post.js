const postsCollection = require("../db").db().collection("posts")
const Notification=require("../models/Notification")
const ObjectID = require("mongodb").ObjectID
const sanitizeHTML = require("sanitize-html")
const fs = require("fs")
const md5 = require("md5")

let Post = function (data, username, postId, name) {
  this.data = data
  this.errors = []
  this.username = username
  this.postId = postId
  this.author = name
  this.likedBy=name
  this.file=data.file
  this.filePath=data.filePath
}

Post.prototype.cleanUp = function () {
  if (typeof this.data.body != "string") {
    this.data.body = ""
  }
  if (typeof this.data.postType != "string") {
    this.data.postType = ""
  }
  if(this.data.postType=="photo"){
    this.data = {
      postType: sanitizeHTML(this.data.postType.trim(), { allowedTags: [], allowedAttributes: {} }),
      username: this.username,
      author: this.author,
      body: sanitizeHTML(this.data.body.trim(), { allowedTags: [], allowedAttributes: {} }),
      link:this.data.link,
      comments: [],
      likedBy: [],
      createdDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
  }else{
    this.data = {
      postType: sanitizeHTML(this.data.postType.trim(), { allowedTags: [], allowedAttributes: {} }),
      username: this.username,
      author: this.author,
      body: sanitizeHTML(this.data.body.trim(), { allowedTags: [], allowedAttributes: {} }),
      comments: [],
      likedBy: [],
      createdDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
  }
}

Post.prototype.validate = function () {
  if (this.data.postType == "text" && this.data.body == "") {
    this.errors.push("You must provide post content.")
  }
  if (this.data.postType == "") {
    this.errors.push("You must chooce post type.")
  }
}

Post.prototype.createPost = function () {
  return new Promise(async(resolve, reject) => {
    try{
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // save post into database
      if(this.data.postType=="photo"){
        await this.photoPostUpload()
      }
      postsCollection
        .insertOne(this.data)
        .then(() => {
          resolve()
        })
        .catch(() => {
          this.errors.push("Please try again later.")
          reject(this.errors)
        })
    } else {
      reject(this.errors)
    }
  }catch{
    reject("Please Try again.There was some problem!!")
  }
  })
}
Post.prototype.photoPostUpload = function () {
  return new Promise(async (resolve, reject) => {
    try {
        let filePath=this.filePath
        let file=this.file
        try {
          if (fs.existsSync(filePath)) {
            //file exists
            reject()
          } else {
            file.mv(filePath, function (error) {
              if (error) {
                reject(error)
              } else {
                resolve("Profile picture successfully uploaded.")
              }
            })
          }
        } catch (err) {
          reject("Sorry there is some problem!! Try again later..")
        }
    } catch {
      reject("There is some problem")
    }
  })
}
Post.findById = function (postId) {
  return new Promise(function (resolve, reject) {
    if (typeof postId != "string") {
      reject()
      return
    }
    postsCollection
      .findOne({ _id: new ObjectID(postId) })
      .then(function (post) {
        resolve(post)
      })
      .catch(function () {
        reject()
      })
  })
}

Post.prototype.like = function (postUsername) {
  return new Promise((resolve, reject) => {
    this.likedByCheck()
      .then(async() => {
        if (!this.errors.length) {
          let likedBy = {
            username: this.username,
            name:this.likedBy
          }

          await postsCollection
            .updateOne(
              { _id: new ObjectID(this.postId) },
              {
                $push: {
                  likedBy: likedBy
                }
              }
            )
            if(this.username!=postUsername){
              let notification = {
                type:"likePost",
                data:{
                  username:this.username,
                  name:this.likedBy,
                  id:this.postId
                },
                createdDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
              } 
              await Notification.sentNotification(postUsername,notification)
            }
            resolve()
        } else {
          reject(this.errors)
        }
      })
      .catch(() => {
        console.log("this line is on catch block")
        reject(this.errors)
      })
  })
}

Post.prototype.likedByCheck = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await postsCollection.findOne({ _id: new ObjectID(this.postId) })
      let likedBy = post.likedBy
      likedBy.forEach(username => {
        if (username.username == this.username) {
          this.present = true
          this.errors.push("You have liked this post already!!")
          resolve()
        }
      })
      resolve()
    } catch {
      reject()
    }
  })
}
Post.prototype.disLike = function () {
  return new Promise((resolve, reject) => {
    this.likedByCheck()
      .then(() => {
        if (this.present) {
          let disLikedBy = {
            username: this.username,
            name:this.likedBy
          }

          postsCollection
            .updateOne(
              { _id: new ObjectID(this.postId) },
              {
                $pull: {
                  likedBy: disLikedBy
                }
              }
            )
            .then(() => {
              resolve()
            })
            .catch(() => {
              console.log("executed")
              this.errors.push("Please try again later.")
              reject(this.errors)
            })
        } else {
          reject(this.errors)
        }
      })
      .catch(() => {
        console.log("this line is on catch block")
        reject(this.errors)
      })
  })
}
Post.prototype.comment = function (postUsername) {
  return new Promise(async(resolve, reject) => {
    try{
    if (typeof this.data.comment != "string") {
      this.data.comment = ""
    }
    if (this.data.comment == "") {
      this.errors.push("You must provide a comment.")
    }
    let comment = {
      username: this.username,
      commentBy: this.author,
      comment: this.data.comment,
      createdDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
    if (!this.errors.length) {
      // save post into database
      await postsCollection
        .updateOne(
          { _id: new ObjectID(this.postId) },
          {
            $push: {
              comments: comment
            }
          }
        )
        if(this.username!=postUsername){
          let notification = {
            type:"commentPost",
            data:{
              username:this.username,
              name:this.author,
              id:this.postId
            },
            createdDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
          }
          await Notification.sentNotification(postUsername,notification)
        }  
        resolve()
    } else {
      reject(this.errors)
    }
  }catch{
    this.errors.push("There is some problem")
    reject(this.errors)
  }
  })
}

Post.prototype.commentOnPost = function (postUsername) {
  return new Promise((resolve, reject) => {
    this.comment(postUsername)
      .then(() => {
        resolve()
      })
      .catch(() => {
        reject()
      })
  })
}

Post.deletePost = function (postIdToDelete, currentUserUsername) {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await postsCollection.findOne({ _id: new ObjectID(postIdToDelete) })
     
      if(post.postType=="photo"){
        let filePath="public"+post.link
        if (fs.existsSync(filePath)) {
            //file exists
            fs.unlinkSync(filePath)
          }
      }
      if (post.username == currentUserUsername) {
        await postsCollection.deleteOne({ _id: new ObjectID(postIdToDelete) })
        resolve()
      } else {
        reject("You do not have permission to perform that action.")
      }
    } catch {
      reject("Problem!")
    }
  })
}


module.exports = Post
