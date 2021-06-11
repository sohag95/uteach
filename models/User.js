const bcrypt = require("bcryptjs")
// const addressCollection = require("../db").db().collection("addressHierarchy")
const notificationCollection = require("../db").db().collection("notifications")
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
  
  if (typeof this.data.name != "string") {
    this.data.name = ""
  }
  if (typeof this.data.dateOfBirth != "string") {
    this.data.dateOfBirth = ""
  }
  if (typeof this.data.phone != "string") {
    this.data.phone = ""
  }
  if (typeof this.data.gender != "string") {
    this.data.gender = ""
  }
  if (typeof this.data.username != "string") {
    this.data.username = ""
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
      bioStatus:"Bio status is not given",
      gender: this.data.gender,
      dob: this.data.dateOfBirth,
      phone:this.data.phone,
      email:"Not given",
      accountType: this.data.accountType,
      address:{
        district:"",
        policeStation:"",
        postOffice:""
      },
      nearBy:"",
      studentData: {
        currentClass: "",
        Institution: "",
        favouriteSubject:"",
        allBatchesTaken: [],
        toppedBatches: []
      },
      password: this.data.password,
      createdDate: new Date()
    }
  } else if (this.data.accountType == "teacher") {
    this.data = {
      username: this.data.username.trim().toLowerCase(),
      name: this.data.name,
      bioStatus:"Bio status is not given",
      gender: this.data.gender,
      dob: this.data.dateOfBirth,
      phone:this.data.phone,
      email:"Not given",
      accountType: this.data.accountType,
      address:{
        district:"",
        policeStation:"",
        postOffice:""
      },
      nearBy:"",
      teacherData: {
        highestQualification: "Not given",
        stream: "Not given",
        favouriteSubject: "Not given",
        secondaryParcentage:"Not given",
        higherSecondaryPercentage:"Not given",
        allBatchesTeach: [],
        homeTuitionAnnouncements:[],
        varifiedAccount: false,
      },
      rating:{givenBy:[]},
      password: this.data.password,
      createdDate: new Date()
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
    if (this.data.accountType == "") {
      this.errors.push("You must select your account-type.")
    }
    if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {
      this.errors.push("Username can only contain letters and numbers.")
    }
    if (this.data.name == "") {
      this.errors.push("You must give your full name.")
    }
    if (this.data.phone == "") {
      this.errors.push("You must provide your phone number.")
    }
    if (this.data.gender == "") {
      this.errors.push("You must select your gender.")
    }
    if (!(this.data.gender == "male" || this.data.gender == "female" || this.data.gender == "custom") ) {
      this.errors.push("Your gender selection is wrong.")
    }
    if (this.data.password == "") {
      this.errors.push("You must provide a password.")
    }
    if (this.data.password.length > 0 && this.data.password.length < 8) {
      this.errors.push("Password must be at least 8 characters.")
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
    if (this.data.username.length > 30) {
      this.errors.push("Your name cannot exceed 30 characters.")
    }
    if (this.data.phone.length > 13) {
      this.errors.push("Your phone number cannot contain more then 13 digits.")
    }
    if (this.data.phone.length < 10) {
      this.errors.push("Your phone number should contain 10 digits.")
    }
    if (this.data.password==this.data.rePassword) {
      this.errors.push("Your confirmation password did not match.")
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


User.prototype.userRegister = function () {
  return new Promise(async (resolve, reject) => {
    // Step #1: Validate user data
    this.cleanUp()
    await this.validate()
    
    // Step #2: Only if there are no validation errors
    // then save the user data into a database
    if (!this.errors.length) {
      let notification={
        username:this.data.username,
        unseenNotificationNumber:0,
        notifications:[]
      }
      // hash user password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await usersCollection.insertOne(this.data)
      await notificationCollection.insertOne(notification)
      resolve()
    } else {
      reject(this.errors)
    }
  })
}


User.prototype.userLogin = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    let username=this.data.username.toLowerCase()
    usersCollection
      .findOne({ username:username })
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
            bioStatus:userDocument.bioStatus,
            dob: userDocument.dob,
            gender: userDocument.gender,
            address: userDocument.address,
            nearBy: userDocument.nearBy,
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
            bioStatus:userDocument.bioStatus,
            dob: userDocument.dob,
            gender: userDocument.gender,
            address: userDocument.address,
            nearBy: userDocument.nearBy,
            email: userDocument.email,
            phone: userDocument.phone,
            accountType: userDocument.accountType,
            teacherData: userDocument.teacherData,
            varifiedAccount:userDocument.teacherData.varifiedAccount,
            rating:userDocument.rating,
            createdDate: userDocument.createdDate
          }
          resolve(userDocument)
        } else if (userDocument.accountType == "studentTeacher") {
          userDocument = {
            username: userDocument.username,
            name: userDocument.name,
            bioStatus:userDocument.bioStatus,
            dob: userDocument.dob,
            gender: userDocument.gender,
            address: userDocument.address,
            nearBy: userDocument.nearBy,
            email: userDocument.email,
            phone: userDocument.phone,
            accountType: userDocument.accountType,
            studentData: userDocument.studentData,
            teacherData: userDocument.teacherData,
            varifiedAccount:userDocument.teacherData.varifiedAccount,
            rating:userDocument.rating,
            createdDate: userDocument.createdDate
          }
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
  if (typeof this.data.phone != "string") {
    this.data.phone = ""
  }
  if (typeof this.data.email != "string") {
    this.data.email = ""
  }
 this.data = {
      name: this.data.name,
      dob: this.data.dob,
      phone:this.data.phone,
      email: this.data.email,
    }
  
}

User.prototype.validateEditableData = function () {
 
    if (this.data.dob == "") {
      this.errors.push("You must provide your date of birth.")
    }
    if (this.data.phone == "") {
      this.errors.push("You must provide your phone number.")
    }
    if (this.data.phone.length<10) {
      this.errors.push("Phone number should contain 10 digit.")
    }
    if (this.data.phone.length>13) {
      this.errors.push("Phone number can not contain more than 13 digits.")
    }
    if (this.data.name == "") {
      this.errors.push("You must give your full name.")
    }
    if (this.data.email == "") {
      this.data.email="Email id is not given"
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
              phone:this.data.phone,
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


User.prototype.addressCleanUp=function(req,res){
  if (typeof this.data.district != "string") {
    this.data.district = ""
  }
  if (typeof this.data.policeStation != "string") {
    this.data.policeStation = ""
  }
  if (typeof this.data.postOffice != "string") {
    this.data.postOffice = ""
  }
  if (typeof this.data.nearBy != "string") {
    this.data.nearBy = ""
  }
  let address={ 
    district:this.data.district,
    policeStation:this.data.policeStation,
    postOffice:this.data.postOffice
  }
  this.data={
    address:address,
    nearBy:this.data.nearBy
  }
  
}


User.prototype.addressValidate=function(req,res){
  if (this.data.district == "") {
    this.errors.push("You must provide your district.")
  }
  if (this.data.policeStation == "") {
    this.errors.push("You must provide your police station.")
  }
  if (this.data.postOffice == "") {
    this.errors.push("You must provide your post office.")
  }
}


User.prototype.updatePresentAddress = function(username) {
  return new Promise(async (resolve, reject) => {
    try {
      this.addressCleanUp()
      this.addressValidate()
      if(!this.errors.length){
        await usersCollection.findOneAndUpdate(
          {username: username},
          {$set: {
                address: this.data.address,
                nearBy:this.data.nearBy
              }
          })
          resolve()
      }else{
        reject()
      }
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
      let address={
        district:data.district,
        policeStation:data.policeStation,
        postOffice:data.postOffice
      }
      let tuitorsAnnouncements = await homeTuitionCollection.find({address:address}).toArray()
      
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
      let address={
        district:data.district,
        policeStation:data.policeStation,
        postOffice:data.postOffice
      }
      let batches = await batchCollection.aggregate([{ $match:{$and:[{address:address},{class:data.class}]} }]).toArray()
      
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

User.prototype.updateBioStatus=function(username){
  return new Promise(async (resolve, reject) => {
    try{
      if (typeof this.data.bioStatus != "string") {
        this.data.bioStatus = ""
      }
      if(this.data.bioStatus==""){
        this.data.bioStatus="Bio status is not given."
      }
      if(this.data.bioStatus.length>250){
        this.errors.push("Bio status can't contain more then 250 characters.")
      }
      if(!this.errors.length){
        await usersCollection.findOneAndUpdate(
          {username: username},
         {$set: {
                bioStatus: this.data.bioStatus
                }
          })
          resolve()
      }else{
        reject()
      }

    }catch{
      this.errors.push("There is some problem!")
      reject()
    }
  })
}

//#########ADDRESS RELATED FUNCTIONS#################

// User.policeStations = function (district) {
//   return new Promise(async (resolve, reject) => {
//     if (typeof district == "string") {
//       let allPoliceStations = await addressCollection.findOne({type:"policeStations"})
//       let districts=allPoliceStations.districts
//       let policeStations=districts
//       console.log("Police Stations:",policeStations)
//       resolve(policeStations)
//     } else {
//       reject()
//     }
//   })
// }

// User.postOffices = function (policeStation) {
//   return new Promise(async (resolve, reject) => {
//     if (typeof policeStation == "string") {
//       let allpostOffices = await addressCollection.findOne({type:"postOffices"})
//       let policeStations=allpostOffices.policeStations
//       let postOffices=policeStations.policeStation
//       console.log("Post offices:",postOffices)
//       resolve(postOffices)
//     } else {
//       reject()
//     }
//   })
// }
module.exports = User
