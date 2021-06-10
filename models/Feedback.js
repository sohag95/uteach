const feedbackCollection = require("../db").db().collection("feedbacks")
const sanitizeHTML = require("sanitize-html")

let Feedback = function (data, username,name) {
  this.data = data
  this.errors = []
  this.username = username
  this.name=name
}

Feedback.prototype.cleanUp = function () {
  if (typeof this.data.stdHelpful != "string") {
    this.data.stdHelpful = ""
  }
  if (typeof this.data.tecHelpful != "string") {
    this.data.tecHelpful = ""
  }
  if (typeof this.data.userFriendly != "string") {
    this.data.userFriendly = ""
  }
  if (typeof this.data.hasError != "string") {
    this.data.hasError = ""
  }
  if (typeof this.data.experiance != "string") {
    this.data.experiance = ""
  }
  if (typeof this.data.suggession != "string") {
    this.data.suggession = ""
  }
  
  this.data = {
    username: this.username,
    name:this.name,
    stdHelpful: sanitizeHTML(this.data.stdHelpful.trim(), { allowedTags: [], allowedAttributes: {} }),
    tecHelpful: sanitizeHTML(this.data.tecHelpful.trim(), { allowedTags: [], allowedAttributes: {} }),
    userFriendly: sanitizeHTML(this.data.userFriendly.trim(), { allowedTags: [], allowedAttributes: {} }),
    hasError: sanitizeHTML(this.data.hasError.trim(), { allowedTags: [], allowedAttributes: {} }),
    experiance: sanitizeHTML(this.data.experiance.trim(), { allowedTags: [], allowedAttributes: {} }),
    suggession: sanitizeHTML(this.data.suggession.trim(), { allowedTags: [], allowedAttributes: {} })
  }

  // get rid of any bogus properties
}

Feedback.prototype.validate =async function () {
  if (this.data.stdHelpful == "") {
    this.errors.push("please say does the system helpful for students?")
  }
  if (this.data.tecHelpful == "") {
    this.errors.push("please say does the system helpful for teachers?.")
  }
  if (this.data.userFriendly == "") {
    this.errors.push("please say does the system user friendly?")
  }
  if (this.data.hasError == "") {
    this.errors.push("please say did you get any error?")
  }
  if (this.data.experiance == "") {
    this.errors.push("please say how was your experience?")
  }
  if (this.data.suggession == "") {
    this.errors.push("please give your suggession.")
  }

  let given=await feedbackCollection.findOne({username:this.username})
  if (given) {
    this.errors.push("You have already given your feedback.")
  }

}

Feedback.prototype.getFeedback = function () {
  return new Promise(async(resolve, reject) => {
    this.cleanUp()
    await this.validate()
    if (!this.errors.length) {
      // save Feedback into database
      await feedbackCollection.insertOne(this.data)
      resolve()
    } else {
      reject(this.errors)
    }
  })
}
module.exports=Feedback