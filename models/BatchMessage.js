
const batchCollection = require("../db").db().collection("batches")

const ObjectID = require('mongodb').ObjectID
const sanitizeHTML = require('sanitize-html')

let BatchMessage = function(data,username,name,batch) {
    this.data = data
    this.username=username
    this.name=name
    this.batch=batch
    this.errors = []
}

BatchMessage.prototype.cleanUp = function() {
  if (typeof(this.data.message) != "string") {this.data.message = ""}
  // get rid of any bogus properties
  this.data = {
    username:this.username,
    name:this.name,
    message: sanitizeHTML(this.data.message.trim(), {allowedTags: [], allowedAttributes: {}}),
    createdDate:new Date().toLocaleString([], {day:'2-digit',month:'2-digit',hour: '2-digit', minute:'2-digit',timeZone: "Asia/Kolkata"})
     //new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),   
  }
}

BatchMessage.prototype.validate = function() {
  if (this.data.message == "") {this.errors.push("You must provide a message.")}
}

BatchMessage.prototype.sentMessage = function(batchId) {
  return new Promise(async(resolve, reject) => {
    try{
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // save post into database
      await batchCollection.updateOne(
        { _id: new ObjectID(this.batch._id) },
        {
          $push: {
            groupMessages: this.data
          }
        }
      )
      resolve()
    } else {
      reject(this.errors)
    }
  }catch{
    reject("There is some problem!!")
  }
  })
}

module.exports = BatchMessage