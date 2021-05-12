
const userCollection = require("../db").db().collection("users")

let Rating = function (data,username,name) {
  this.data = data
  this.username=username
  this.name=name
  this.errors = []
}
Rating.prototype.cleanUp=function(){
  if (typeof this.data.comment != "string") {
    this.data.comment = ""
  }
  if (typeof this.data.star != "string") {
    this.data.star = ""
  }
  
  this.data={
    username:this.username,
    name:this.name,
    rated:this.data.star,
    comment:this.data.comment,
    createdDate:new Date().toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
  }
}
Rating.prototype.validate=function(){
  if (this.data.comment == "") {
    this.errors.push("You must provide a comment.")
  }
  if (this.data.rated == "") {
    this.errors.push("You must provide rating.")
  }
}
Rating.prototype.giveRating = function (username) {
   return new Promise(async (resolve, reject) => {
    try {
      this.cleanUp()
      this.validate()
      if (!this.errors.length) {
        await userCollection.findOneAndUpdate(
          {
            username:username
          },
          {
            $push: {
              "rating.givenBy": this.data
            }
          }
        )
        resolve()
      }else{
        reject(this.errors)
      }
    } catch {
      this.errors.push("There is some problem")
      reject(this.errors)
    }
  })
}

Rating.prototype.updateRating = function (username) {
  return new Promise(async (resolve, reject) => {
    try {
      
        resolve()
    } catch {
      reject()
    }
  })
}

module.exports = Rating
