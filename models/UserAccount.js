const usersCollection = require("../db").db().collection("users")

let UserAccount = function (data) {
  this.data = data
  this.errors = []
}

UserAccount.prototype.cleanUp = function () {
  if (typeof this.data.highestQualification != "string") {
    this.data.highestQualification = ""
  }
  if (typeof this.data.stream != "string") {
    this.data.stream = ""
  }
  if (typeof this.data.subject != "string") {
    this.data.subject = ""
  }
  if (typeof this.data.secondaryPercentage != "string") {
    this.data.secondaryPercentage = ""
  }
  if (typeof this.data.higherSecondaryPercentage != "string") {
    this.data.higherSecondaryPercentage = ""
  }
  if(this.data.secondaryPercentage == ""){
    this.data.secondaryPercentage = "Not-qualified"
  }
  if(this.data.higherSecondaryPercentage == ""){
    this.data.higherSecondaryPercentage = "Not-qualified"
  }

  this.data = {
    highestQualification: this.data.highestQualification,
    stream: this.data.stream,
    favouriteSubject:this.data.favouriteSubject,
    secondaryPercentage:this.data.secondaryPercentage,
    higherSecondaryPercentage:this.data.higherSecondaryPercentage,
    allBatchesTeach: [],
    homeTuitionAnnouncements:[],
    varifiedAccount: false,
    createdDate: new Date()
  }
}
UserAccount.prototype.validate = function () {
  if (this.data.highestQualification == "") {
    this.errors.push("You must select valid qualification.")
  }
  if (this.data.stream == "") {
    this.errors.push("You must select a stream.")
  }
  if (this.data.favouriteSubject == "") {
    this.errors.push("You must provide subject name.")
  }

  if ((this.data.highestQualification == "secondary" ||
      this.data.highestQualification == "higher-secondary" ||
      this.data.highestQualification == "under-graduated" ||
      this.data.highestQualification == "post-graduated" ||
      this.data.highestQualification == "phd-graduated" )&&
      this.data.secondaryPercentage=="Not-qualified") {
    this.errors.push("You have passed class-10.So you must give your secondary parcentage.")
  }
  if ((this.data.highestQualification == "higher-secondary" ||
  this.data.highestQualification == "under-graduated" ||
  this.data.highestQualification == "post-graduated" ||
  this.data.highestQualification == "phd-graduated" )&&
  this.data.higherSecondaryPercentage=="Not-qualified") {
    this.errors.push("You have passed class-12.So you must give your higher-secondary parcentage.")
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
            rating:{givenBy:[]},
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

UserAccount.prototype.updateTeacherData = function (username) {
  return new Promise(async(resolve, reject)=> {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      await usersCollection.findOneAndUpdate(
        { username: username },
        {
          $set: {
            "teacherData.highestQualification":this.data.highestQualification,
            "teacherData.stream":this.data.stream,
            "teacherData.favouriteSubject":this.data.favouriteSubject,
            "teacherData.secondaryPercentage":this.data.secondaryPercentage,
            "teacherData.higherSecondaryPercentage":this.data.higherSecondaryPercentage
          }
        }
      )
      resolve()
    } else {
      reject()
    }
  })
}
module.exports = UserAccount
