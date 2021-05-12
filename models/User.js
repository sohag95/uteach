const bcrypt = require("bcryptjs")
const usersCollection = require("../db").db().collection("users")
const homeTuitionCollection = require("../db").db().collection("homeTuition")
const batchCollection = require("../db").db().collection("batches")
const fs = require("fs")
const validator = require("validator")
const md5 = require("md5")

let User = function (data) {
  this.data = data
  this.errors = []
}

User.prototype.cleanUp = function () {
  if (typeof this.data.username != "string") {
    this.data.username = ""
  }
  if (typeof this.data.name != "string") {
    this.data.name = ""
  }
  if (typeof this.data.email != "string") {
    this.data.email = ""
  }
  if (typeof this.data.accountType != "string") {
    this.data.accountType = ""
  }
  if (typeof this.data.password != "string") {
    this.data.password = ""
  }
  if (this.data.accountType == "student") {
    this.data = {
      username: this.data.username.trim().toLowerCase(),
      name: this.data.name,
      allDataGiven:false,
      gender: null,
      dob: null,
      address: null,
      phone:null,
      email: this.data.email,
      accountType: this.data.accountType,
      studentData: {
        currentClass: "",
        streamStudy: "",
        allBatchesTaken: [],
        toppedBatches: []
      },
      notifications: [],
      password: this.data.password,
      createdDate: new Date()
    }
  } else if (this.data.accountType == "teacher") {
    this.data = {
      username: this.data.username.trim().toLowerCase(),
      name: this.data.name,
      allDataGiven:false,
      gender: null,
      dob: null,
      address: null,
      phone:null,
      email: this.data.email,
      accountType: this.data.accountType,
      teacherData: {
        qualification: "",
        streamTeach: "",
        subject: "",
        allBatchesTeach: [],
        homeTuitionAnnouncements:[],
        varifiedAccount: false,
        createdDate: new Date()
      },
      rating:{givenBy:[]},
      notifications: [],
      password: this.data.password
    }
  } else {
    this.errors.push("Invalid account type.")
  }
}

User.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    
    if (this.data.username == "") {
      this.errors.push("You must provide a username.")
    }
    if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {
      this.errors.push("Username can only contain letters and numbers.")
    }
    if (this.data.name == "") {
      this.errors.push("You must give your full name.")
    }
    if (this.data.email == "") {
      this.errors.push("You must provide a email address.")
    }
    if (this.data.email) {
      if (!validator.isEmail(this.data.email)) {
        this.errors.push("You must provide a valid email address.")
      }
    }

    if (this.data.password == "") {
      this.errors.push("You must provide a password.")
    }
    if (this.data.password.length > 0 && this.data.password.length < 5) {
      this.errors.push("Password must be at least 5 characters.")
    }
    if (this.data.password.length > 50) {
      this.errors.push("Password cannot exceed 50 characters.")
    }
    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push("Username must be at least 3 characters.")
    }
    if (this.data.username.length > 30) {
      this.errors.push("Username cannot exceed 30 characters.")
    }

    // Only if username is valid then check to see if it's already taken
    if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
      let usernameExists = await usersCollection.findOne({ username: this.data.username })
      if (usernameExists) {
        this.errors.push("Sorry,that username is already taken.")
      }
    }
    resolve()
  })
}

User.prototype.userLogin = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    usersCollection
      .findOne({ username: this.data.username })
      .then(attemptedUser => {
        if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
          this.data = attemptedUser
          resolve("Congrats!")
        } else {
          reject("Invalid username / password.")
        }
      })
      .catch(function () {
        reject("Please try again later.")
      })
  })
}

User.prototype.userRegister = function () {
  return new Promise(async (resolve, reject) => {
    // Step #1: Validate user data
    this.cleanUp()
    await this.validate()

    // Step #2: Only if there are no validation errors
    // then save the user data into a database
    if (!this.errors.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await usersCollection.insertOne(this.data)
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

User.findByUsername = function (username) {
  return new Promise(function (resolve, reject) {
    if (typeof username != "string") {
      reject()
      return
    }
    usersCollection
      .findOne({ username: username })
      .then(function (userDocument) {
        if (userDocument.accountType == "student") {
          userDocument = {
            username: userDocument.username,
            name: userDocument.name,
            dob: userDocument.dob,
            gender: userDocument.gender,
            address: userDocument.address,
            email: userDocument.email,
            phone: userDocument.phone,
            accountType: userDocument.accountType,
            studentData: userDocument.studentData,
            createdDate: userDocument.createdDate
          }
          resolve(userDocument)
        } else if (userDocument.accountType == "teacher") {
          userDocument = {
            username: userDocument.username,
            name: userDocument.name,
            dob: userDocument.dob,
            gender: userDocument.gender,
            address: userDocument.address,
            email: userDocument.email,
            phone: userDocument.phone,
            accountType: userDocument.accountType,
            teacherData: userDocument.teacherData,
            rating:userDocument.rating,
            createdDate: userDocument.createdDate
          }
          resolve(userDocument)
        } else if (userDocument.accountType == "studentTeacher") {
          userDocument = {
            username: userDocument.username,
            name: userDocument.name,
            dob: userDocument.dob,
            gender: userDocument.gender,
            address: userDocument.address,
            email: userDocument.email,
            phone: userDocument.phone,
            accountType: userDocument.accountType,
            studentData: userDocument.studentData,
            teacherData: userDocument.teacherData,
            rating:userDocument.rating,
            createdDate: userDocument.createdDate
          }

         
          console.log("User owner :")
          resolve(userDocument)
        } else {
          reject()
        }
      })
      .catch(function () {
        console.log("i am here")
        reject()
      })
  })
}

User.prototype.cleanUpEditableData = function () {
  if (typeof this.data.name != "string") {
    this.data.name = ""
  }
  if (typeof this.data.dob != "string") {
    this.data.dob = ""
  }
  if (typeof this.data.address != "string") {
    this.data.address = ""
  }
  if (typeof this.data.phone != "string") {
    this.data.phone = ""
  }
  if (typeof this.data.gender != "string") {
    this.data.gender = ""
  }
  if (typeof this.data.email != "string") {
    this.data.email = ""
  }
 this.data = {
      name: this.data.name,
      gender: this.data.gender,
      dob: this.data.dob,
      address: this.data.address,
      phone:this.data.phone,
      email: this.data.email,
    }
  
}

User.prototype.validateEditableData = function () {
 
    if (this.data.gender == "") {
      this.errors.push("You must select your gender.")
    }
    if (this.data.dob == "") {
      this.errors.push("You must provide your date of birth.")
    }
    if (this.data.address == "") {
      this.errors.push("You must provide your address.")
    }
    if (this.data.phone == "") {
      this.errors.push("You must provide your phone number.")
    }
    if (this.data.name == "") {
      this.errors.push("You must give your full name.")
    }
    if (this.data.email == "") {
      this.errors.push("You must provide a email address.")
    }
    if (this.data.email) {
      if (!validator.isEmail(this.data.email)) {
        this.errors.push("You must provide a valid email address.")
      }
    }
}
User.prototype.updateProfile = function(username, updateUsername) {
  return new Promise(async (resolve, reject) => {
    try {
      let owner = await User.findUserProfile(username, updateUsername)
      console.log(owner)
      if (owner) {
        // actually update the db
        let status = await this.actuallyUpdate(updateUsername)
        resolve(status)
      } else {
        reject()
      }
    } catch {
      reject()
    }
  })
}
User.prototype.actuallyUpdate = function(updateUsername) {
  return new Promise(async (resolve, reject) => {
    this.cleanUpEditableData()
    this.validateEditableData()
    if (!this.errors.length) {
      await usersCollection.findOneAndUpdate(
        {username: updateUsername},
       {$set: {
              name: this.data.name,
              dob:this.data.dob,
              address: this.data.address,
              phone:this.data.phone,
              gender: this.data.gender,
              email: this.data.email}})
      resolve("success")
    } else {
      resolve("failure")
    }
  })
}
User.findUserProfile = function(username, updateUsername) {
  return new Promise(async function(resolve, reject) {
    if (typeof(updateUsername) != "string") {
      reject()
      return
    } 
   if(username==updateUsername){
    Owner=true
    console.log(Owner)
    resolve(Owner)
    } else {
      reject()
    }
  })
}


User.getNotifications = function (username) {
  return new Promise(async (resolve, reject) => {
    try {
      // Step #1: Validate user data
      let userData = await usersCollection.findOne({ username: username })
      let notifications = userData.notifications
      resolve(notifications)
    } catch {
      reject()
    }
  })
}

User.search = function (searchTerm) {
  return new Promise(async (resolve, reject) => {
    if (typeof searchTerm == "string") {
      let users = await usersCollection.aggregate([{ $match: { $text: { $search: searchTerm } } }, { $sort: { score: { $meta: "textScore" } } }]).toArray()
      usersData = users.map(user => {
        data = {
          username: user.username,
          name: user.name
        }
        return data
      })
      console.log(usersData)
      resolve(usersData)
    } else {
      reject()
    }
  })
}
User.searchHomeTuitor=function(data){
  return new Promise(async (resolve, reject) => {
    try{
      let tuitorsAnnouncements = await homeTuitionCollection.aggregate([{ $match:{$and:[{district:data.district},{policeStation:data.policeStation},{postOffice:data.postOffice}]} }]).toArray()
      
      console.log("results:",tuitorsAnnouncements)
      resolve(tuitorsAnnouncements)
    }catch{
      reject()
    }
  })
}
User.searchBatch=function(data){
  return new Promise(async (resolve, reject) => {
    try{
      let batches = await batchCollection.aggregate([{ $match:{$and:[{district:data.district},{policeStation:data.policeStation},{postOffice:data.postOffice},{class:data.class}]} }]).toArray()
      
      console.log("results:",batches)
      resolve(batches)
    }catch{
      reject()
    }
  })
}



User.uploadingProfilePicture = function (filePath, file) {
  return new Promise(async (resolve, reject) => {
    try {
        try {
          if (fs.existsSync(filePath)) {
            //file exists
            try {
              fs.unlinkSync(filePath)
              //file removed
              file.mv(filePath, function (error) {
                if (error) {
                  reject(error)
                } else {
                  resolve("Profile picture successfully updated.")
                }
              })
            } catch (err) {
              reject("There is some problem!!")
            }
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
      reject("Problem!!")
    }
  })
}

User.uploadingCoverPicture = function (filePath, file) {
  return new Promise(async (resolve, reject) => {
    try {
        try {
          if (fs.existsSync(filePath)) {
            //file exists
            try {
              fs.unlinkSync(filePath)
              //file removed
              file.mv(filePath, function (error) {
                if (error) {
                  reject(error)
                } else {
                  resolve("Cover picture successfully updated.")
                }
              })
            } catch (err) {
              reject("There is some problem!!")
            }
          } else {
            file.mv(filePath, function (error) {
              if (error) {
                reject(error)
              } else {
                resolve("Cover picture successfully uploaded.")
              }
            })
          }
        } catch (err) {
          reject("Sorry there is some problem!! Try again later..")
        }
    } catch {
      reject("Problem!!")
    }
  })
}

module.exports = User
