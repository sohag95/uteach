const libraryCollection = require("../db").db().collection("library")
const sanitizeHTML = require("sanitize-html")

let Library = function (data,username) {
  this.data = data
  this.username=username
  this.errors = []
}
Library.prototype.cleanUp=function(){
  if (typeof this.data.noteType != "string") {
    this.data.noteType = ""
  }
  if (typeof this.data.about != "string") {
    this.data.about = ""
  }
  if (this.data.noteType=="text" && typeof this.data.contant != "string") {
    this.data.contant = ""
  }
  this.data={
    noteType: sanitizeHTML(this.data.noteType.trim(), { allowedTags: [], allowedAttributes: {} }),
    about: sanitizeHTML(this.data.about.trim(), { allowedTags: [], allowedAttributes: {} }),
    content: this.data.content,
    createdDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) 
  }
  this.createLibrary={
    username:this.username,
    libraryItems:[]
  }
}
Library.prototype.validate=function(){
  if (this.data.noteType == "") {
    this.errors.push("You must select note type.")
  }
  if (this.data.about == "") {
    this.errors.push("You must write about the note.")
  }
  if (this.data.content == "") {
    this.errors.push("You must provide content of your note.")
  }
}
Library.prototype.addNote=function(){
  return new Promise(async(resolve, reject) => {
    this.cleanUp()
    this.validate()
    let libraryExists=await this.ifLibraryExists()
    if(!libraryExists){
      await libraryCollection.insertOne(this.createLibrary)
    }
    if (!this.errors.length) {
      await libraryCollection.updateOne(
        { username: this.username },
        {
          $push: {
            libraryItems: this.data
          }
        }
      )
      resolve()
    } else {
      reject(this.errors)
    }
  })
}
Library.prototype.ifLibraryExists=function(){
  return new Promise(async(resolve, reject) => {
    try{
    let present=await libraryCollection.findOne({username:this.username})
    if(present){
      resolve(true)
    }else{
      resolve(false)
    }
  }catch{
    this.errors.push("There is some problem.")
    reject()
  }
  })
}

Library.getEditItemData=function(username,index){
  return new Promise(async(resolve, reject) => {
    try{
    let items=await libraryCollection.findOne({username:username})
    if(items){
      item=items.libraryItems[Number(index)]
      resolve(item)
    }else{
      resolve("notFound")
    }
  }catch{
    this.errors.push("There is some problem.")
    reject()
  }
  })
}

Library.prototype.updateItem=function(index){
  return new Promise(async(resolve, reject) => {
    try{
      this.cleanUp()
      this.validate()
      let updatePlace="libraryItems."+index
      if (!this.errors.length) {
      await libraryCollection.findOneAndUpdate(
        { username: this.username },
        {
          $set: {
            [updatePlace]:this.data
          }
        }
      )
      resolve()
    }else{
      reject(this.errors)
    }
  }catch{
    this.errors.push("There is some problem.")
    reject(this.errors)
  }
  })
}
module.exports=Library