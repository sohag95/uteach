const usersCollection = require("../db").db().collection("users")

let UserAccount = function (data) {
  this.data = data
  this.errors = []
}

UserAccount.prototype.cleanUp = function () {
  if (typeof this.data.qualification != "string") {
    this.data.qualification = ""
  }
  if (typeof this.data.stream != "string") {
    this.data.stream = ""
  }
  if (typeof this.data.subject != "string") {
    this.data.subject = ""
  }

  this.data = {
    qualification: this.data.qualification,
    streamTeach: this.data.stream,
    subject: this.data.subject,
    allBatchesTeach: [],
    homeTuitionAnnouncements:[],
    varifiedAccount: false,
    createdDate: new Date()
  }
}
UserAccount.prototype.validate = function () {
  if (this.data.qualification == "") {
    this.errors.push("You must select valid qualification.")
  }
  if (this.data.stream == "") {
    this.errors.push("You must select stream.")
  }
  if (this.data.subject == "") {
    this.errors.push("You must provide subject name.")
  }
}

UserAccount.prototype.upgradeAccount = function (username) {
  return new Promise(async (resolve, reject) => {
    // Step #1: Validate user data
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      await usersCollection.findOneAndUpdate(
        { username: username },
        {
          $set: {
            accountType: "studentTeacher",
            teacherData: this.data,
          }
        }
      )
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

UserAccount.ifUserStudent = function (username) {
  return new Promise(function (resolve, reject) {
    if (typeof username != "string") {
      reject()
      return
    }
    usersCollection
      .findOne({ username: username })
      .then(function (userDocument) {
        if (userDocument.accountType == "student") {
          resolve()
        } else {
          reject()
        }
      })
      .catch(function () {
        console.log("there is some problem.")
        reject()
      })
  })
}
module.exports = UserAccount
