const User = require("../models/User")
const Batch = require("../models/Batch")
const Operations = require("../models/Operations")
const Rating = require("../models/Rating")
const batchCollection = require("../db").db().collection("batches")
const homeTuitionCollection = require("../db").db().collection("homeTuition")
const postsCollection = require("../db").db().collection("posts")
const sessionsCollection = require("../db").db().collection("sessions")

exports.userMustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    req.flash("errors", "Please log-In/Sign-Up first to perform that action.")
    req.session.save(function () {
      res.redirect("/log-in")
    })
  }
}
exports.userMustBeLoggedInAsTeacher = function (req, res, next) {
  if (req.session.user) {
    if (req.session.user.accountType == "teacher" || req.session.user.accountType == "studentTeacher") {
      next()
    } else {
      req.flash("errors", "You must be logged in as a teacher to perform that action.")
      req.session.save(function () {
        res.redirect("/")
      })
    }
  } else {
    req.flash("errors", "Please log-In/Sign-Up first to perform that action.")
    req.session.save(function () {
      res.redirect("/log-in")
    })
  }
}
exports.userMustBeLoggedInAsStudent = function (req, res, next) {
  if (req.session.user) {
    if (req.session.user.accountType == "student" || req.session.user.accountType == "studentTeacher") {
      next()
    } else {
      req.flash("errors", "You must be logged in as a student to perform that action.")
      req.session.save(function () {
        res.redirect("/")
      })
    }
  } else {
    req.flash("errors", "Please log-In/Sign-Up first to perform that action.")
    req.session.save(function () {
      res.redirect("/log-in")
    })
  }
}
// log in check end
exports.doesUsernameExist = function(req, res) {
  User.findByUsername(req.body.username).then(function() {
    res.json(true)
  }).catch(function() {
    res.json(false)
  })
}
//user register starts
exports.userRegister = function (req, res) {
  let user = new User(req.body)
  user
    .userRegister()
    .then(() => {
      req.flash("success", "Successfully created your account.Welcome to UTEACH community!!")
      req.session.user = { username: user.data.username, name: user.data.name, accountType: user.data.accountType }
      req.session.save(function () {
        res.redirect("/user-home")
      })
    })
    .catch(regErrors => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/sign-up")
      })
    })
}



exports.viewProfileEditScreen = async function(req, res) {
  try {
    let user = await User.findByUsername(req.params.username)
    console.log("view profile:",user)
    let editableData={
      name:user.name,
      dob:user.dob,
      address:user.address,
      nearBy:user.nearBy,
      phone:user.phone,
      email:user.email
    }
    console.log("data:",editableData)
    if (user.username==req.username) {
      res.render("edit-profile", {editableData: editableData})
    } else {
      req.flash("errors", "You do not have permission to perform that action.")
      req.session.save(() => res.redirect(`/profile/${req.username}`))
    }
  } catch {
    res.render("404")
  }
}
exports.editProfile = function(req, res) {
  let user= new User(req.body)
  console.log(req.username)
  user.updateProfile(req.username, req.params.username).then((status) => {
    // the post was successfully updated in the database
    if (status == "success") {
      // post was updated in db
      req.flash("success", "Profile successfully updated.")
      req.session.save(function() { 
        res.redirect(`/profile/${req.username}/edit`)
      })
    } else {
      user.errors.forEach(function(error) {
        req.flash("errors", error)
      })
      req.session.save(function() {
        res.redirect(`/profile/${req.username}/edit`)
      })
    }
  }).catch(() => {
    req.flash("errors", "You do not have permission to perform that action.")
    req.session.save(function() {
      res.redirect("/")
    })
  })
}

exports.updatePresentAddress=function(req,res){
  try{
    if(req.params.username==req.username){
      console.log("Address:",req.body)
      let user= new User(req.body)
      user.updatePresentAddress(req.username).then(()=>{
        req.flash("success", "Profile address successfully updated.")
        req.session.save(function() { 
          res.redirect(`/profile/${req.username}/edit`)
        })
      }).catch(()=>{
        user.errors.forEach(function(error) {
          req.flash("errors", error)
        })
        req.session.save(function() {
          res.redirect(`/profile/${req.username}/edit`)
        })
      })
    }else{
      req.flash("errors", "You do not have permission to perform that action.")
    req.session.save(function() {
      res.redirect("/")
    })
    }
  }catch{

  }
}

exports.logout = function (req, res) {
  req.flash("success", "Logged out successfully.")
  req.session.destroy(function () {
    res.redirect("/")
  })
}


exports.userLogin = function (req, res) {
  let user = new User(req.body)
  user
    .userLogin()
    .then(function (result) {
      req.session.user = { username: user.data.username, name: user.data.name, accountType: user.data.accountType }
      req.session.save(function () {
        res.redirect("/user-home")
      })
    })
    .catch(function (e) {
      req.flash("errors", e)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.ifUserExists = function (req, res, next) {
  console.log(req.params.username)
  User.findByUsername(req.params.username)
    .then(function (userDocument) {
      req.profileUser = userDocument
      req.isVisitorsProfile = false
      if (req.profileUser.username == req.username) {
        req.isVisitorsProfile = true
      }
      req.profileHeaderData={
        username:userDocument.username,
        name:userDocument.name,
        bioStatus:userDocument.bioStatus,
        isVisitorsProfile:req.isVisitorsProfile
      }
      console.log("executed")
      next()
    })
    .catch(function () {
      console.log("executed here")
      res.render("404")
    })
}

exports.getConnectionsForProfile =async function (req, res, next) {
  try{
    let operation=new Operations(req.profileUser.username,req.profileUser.accountType)
    operation.getConnections().then((connections)=>{
      req.connections=connections
      next()
    }).catch(()=>{
      console.log("I am here now!")
      res.render("404")
    })
  }catch{

  }
}
exports.getUserProfileData = async function (req, res) {
  try {
    console.log("connections",req.connections.studentConnections.allFriends,req.connections.studentConnections.allTeachers,req.connections.teacherConnections.allStudents)
    let allFeeds = await postsCollection.find({ username: req.profileUser.username}).toArray()
    allFeeds=allFeeds.reverse()
    res.render("user-profile", {
      profileHeaderData:req.profileHeaderData,
      profileUser: req.profileUser,
      isVisitorsProfile: req.isVisitorsProfile,
      allFeeds:allFeeds,
      connections:req.connections
    })
  } catch {
    res.render("404")
  }
}

//profile containing router's functions
exports.runningBatches=async function(req,res){
  try{

    let takenRunningBatches=[]
    let teachRunningBatches=[]
    let runningHomeTuitions=[]

    if (req.profileUser.accountType == "student" || req.profileUser.accountType == "studentTeacher") {
      let batchesId = req.profileUser.studentData.allBatchesTaken
      let batchesIds = batchesId.map(batchId => {
        return batchId.batchId
      })
      console.log("BatchesId taken",batchesIds)
      batchesTaken = await Batch.getBatches(batchesIds)
      batchesTaken.forEach((batch)=>{
        if(batch.presentBatch){
          takenRunningBatches.push(batch)
        }
      })
      console.log("taken running batches :",takenRunningBatches)
    }
    if (req.profileUser.accountType == "teacher" || req.profileUser.accountType == "studentTeacher") {
      let teacherBatches = await batchCollection.find({ username: req.profileUser.username }).sort({ createdDate: -1 }).toArray()
      let homeTuitions = await homeTuitionCollection.find({ username: req.profileUser.username }).sort({ createdDate: -1 }).toArray()
      
      teacherBatches.forEach((batch)=>{
        if(batch.presentBatch){
          teachRunningBatches.push(batch)
        }
      })
      homeTuitions.forEach((tuition)=>{
        if(tuition.presentAnnouncement){
          runningHomeTuitions.push(tuition)
        }
      })
    }

    let runningBatches={
      takenRunningBatches:takenRunningBatches,
      teachRunningBatches:teachRunningBatches,
      runningHomeTuitions:runningHomeTuitions
    }
    console.log("Running batches:",runningBatches)
    res.render("running-batches", {
      profileHeaderData:req.profileHeaderData,
      runningBatches: runningBatches,
      isVisitorsProfile: req.isVisitorsProfile,
      accountType:req.profileUser.accountType
    })
  }catch{
    res.render("404")
  }
}


exports.allTeachers = async function (req, res) {
  try {
    if (req.profileUser.accountType == "student" || req.profileUser.accountType == "studentTeacher") {
      let operations = new Operations()
      let batchesId = req.profileUser.studentData.allBatchesTaken
      let batchesIds = batchesId.map(batchId => {
        return batchId.batchId
      })
      let studentBatches = await Batch.getBatches(batchesIds)
      let allTeachers = studentBatches.map(batch => {
        let teacher = {
          username: batch.username,
          teacherName: batch.teacherName
        }
        return teacher
      })
      let teachers = operations.removeDuplicates(allTeachers, "username")

      res.render("teachers", {
        profileHeaderData:req.profileHeaderData,
        teachers: teachers,
        isVisitorsProfile: req.isVisitorsProfile
      })
    } else {
      res.render("404")
    }
  } catch {
    res.render("404")
  }
}

exports.allFriends = async function (req, res) {
  try {
    if (req.profileUser.accountType == "student" || req.profileUser.accountType == "studentTeacher") {
      let operations = new Operations()
      let allFriends = []
      let batchesId = req.profileUser.studentData.allBatchesTaken
      let batchesIds = batchesId.map(batchId => {
        return batchId.batchId
      })
      let studentBatches = await Batch.getBatches(batchesIds)
      studentBatches.forEach(batch => {
        batch.admittedStudents.forEach(student => {
          if (student.username != req.profileUser.username) {
            allFriends.push(student)
          }
        })
      })
      let friends = operations.removeDuplicates(allFriends, "username")

      res.render("friends", {
        profileHeaderData:req.profileHeaderData,
        friends: friends,
        isVisitorsProfile: req.isVisitorsProfile
      })
    } else {
      res.render("404")
    }
  } catch {
    res.render("404")
  }
}

exports.allStudents = async function (req, res) {
  try {
    if (req.profileUser.accountType == "teacher" || req.profileUser.accountType == "studentTeacher") {
      let operations = new Operations()
      let allStudents = []
      let teacherBatches = await batchCollection.find({ username: req.profileUser.username }).sort({ createdDate: -1 }).toArray()
      teacherBatches.forEach(batch => {
        batch.admittedStudents.forEach(student => {
          allStudents.push(student)
        })
      })
      let students = operations.removeDuplicates(allStudents, "username")

      res.render("students", {
        profileHeaderData:req.profileHeaderData,
        students: students,
        isVisitorsProfile: req.isVisitorsProfile
      })
    } else {
      res.render("404")
    }
  } catch {
    res.render("404")
  }
}

exports.updateBioStatus =function (req, res) {
  try {
    if(req.params.username==req.username){
      let user=new User(req.body)
      user.updateBioStatus(req.username).then(()=>{
        req.flash("success","Bio status successfully updated.")
        req.session.save(function() {
          res.redirect(`/profile/${req.username}`)
        })
      }).catch(()=>{
        user.errors.forEach(function(error) {
          req.flash("errors", error)
        })
        req.session.save(function() {
          res.redirect(`/profile/${req.username}`)
        })
      })
    }else{
      req.flash("errors", "You do not have permission to perform that action.")
      req.session.save(function() {
        res.redirect("/")
      })
    }
  } catch {
    res.render("404")
  }
}


exports.getConnectionsForHome =function (req, res, next) {
    let operation=new Operations(req.username,req.accountType)
    operation.getConnections().then((connections)=>{
      req.allConnections=[]
      if(req.accountType=="student" || req.accountType=="studentTeacher"){
        connections.studentConnections.allFriends.forEach(connection => {
          req.allConnections.push(connection.username)
        })
        connections.studentConnections.allTeachers.forEach(connection => {
          req.allConnections.push(connection.username)
        })
      }
    if(req.accountType=="teacher" || req.accountType=="studentTeacher"){
      connections.teacherConnections.allStudents.forEach(connection => {
        req.allConnections.push(connection.username)
      })
    }
    //to remove duplicate usernames
    req.allConnections=[...new Set(req.allConnections)]

    console.log("Req.allConnections",req.allConnections)
      next()
    }).catch(()=>{
      console.log("I am here now!")
      res.render("404")
    })
}
 exports.getActiveContacts =async function (req, res, next) {
 try{
    let activeUsers=await sessionsCollection.find().toArray()
    let activeUsersName=[]
    activeUsers.forEach((user)=>{
      let obj=JSON.parse(user.session)
      if(obj.user!=undefined){
        data={
          username:obj.user.username,
          name:obj.user.name
        }
        activeUsersName.push(data)
      }
      
    })
    //I have to work here tomorrow
    let myActiveConnections=[]
    activeUsersName.forEach((user)=>{
      if(req.allConnections.includes(user.username)){
        myActiveConnections.push(user)
      }
    })

    req.myActiveConnections=myActiveConnections
    console.log("Active connections:",req.myActiveConnections)
  next()
 }catch{
  console.log("I am on active contacts!")
  res.render("404")
 }
}

exports.userHome =async function (req, res) {
  try {
    let allConnections=req.allConnections
    allConnections.push(req.username)
    console.log("All connections",allConnections)
    let allFeeds = await postsCollection.find({ username: { $in: allConnections } }).toArray()
    allFeeds=Operations.shuffle(allFeeds)

    console.log("Feeds:",allFeeds)
     res.render("user-home",{
      myActiveConnections:req.myActiveConnections,
      allFeeds:allFeeds
     })
  } catch {
    res.render("404")
  }
}



exports.getNotifications = async function (req, res) {
  try {
    let notifications = await User.getNotifications(req.username)
    console.log("Notifications:", notifications)
    res.render("notifications", {
      myActiveConnections:req.myActiveConnections,
      notifications: notifications
    })
  } catch {
    res.render("404")
  }
}



exports.guestHome = async function (req, res) {
  try {
    let batches = await batchCollection.find().toArray()
    let homeTuitions = await homeTuitionCollection.find().toArray()
    let shuffleBatches=Operations.shuffle(batches)
    let shuffleHomeTuitions=Operations.shuffle(homeTuitions)

    // first five batches
    let fiveBatches=shuffleBatches.slice(0,6)
    let fiveHomeTuitions=shuffleHomeTuitions.slice(0,6)
    
    let teachersWithRating=await Rating.teachersRating()
    let highestRatedBatchTeachers=teachersWithRating.batchTeachers.sort((a, b) => b.averageRating -a.averageRating);
    let highestRatedTuitionTeachers=teachersWithRating.tuitionTeachers.sort((a, b) => b.averageRating -a.averageRating);
   
    res.render("home-guest", {
      fiveBatches: fiveBatches,
      fiveHomeTuitions:fiveHomeTuitions,
      highestRatedBatchTeachers:highestRatedBatchTeachers,
      highestRatedTuitionTeachers:highestRatedTuitionTeachers
    })
  } catch {
    res.render("404")
  }
}

exports.signUp = function (req, res) {
    //if user is logged in,they can't sign-in/sign-up again.
    if(!req.username){
      res.render("sign-up-form",{
        regErrors: req.flash("regErrors")
      })
    }else{
      req.flash("errors", "Please log out your account first to perform that action.")
      req.session.save(function() {
        res.redirect("/")
      })
    } 
}
exports.logIn = function (req, res) {
    //if user is logged in,they can't sign-in/sign-up again.
    if(!req.username){
      res.render("log-in-form")
    }else{
      req.flash("errors", "Please log out your account first to perform that action.")
      req.session.save(function() {
        res.redirect("/")
      })
    } 
}

exports.search = function (req, res) {
  User.search(req.body.searchTerm)
    .then(users => {
      res.json(users)
    })
    .catch(() => {
      res.json([])
    })
}

exports.searchHomeTuitor = function (req, res) {
  User.searchHomeTuitor(req.body)
    .then(tuitors => {
      res.render("home-tuitor-search-result", {
        tuitors:tuitors
      })
    })
    .catch(() => {
      res.render("404")
    })
}

exports.searchBatch = function (req, res) {
  User.searchBatch(req.body)
    .then(batches => {
      res.render("batch-search-result", {
        batches:batches
      })
    })
    .catch(() => {
      res.render("404")
    })
}


exports.searchHomeTuitorPage = function (req, res) {
  try {
    res.render("search-tuitor-page")
  } catch {
    res.render("404")
  }
}
exports.searchBatchPage = function (req, res) {
  try {
    res.render("search-batch-page")
  } catch {
    res.render("404")
  }
}

exports.uploadProfilePicture = function (req, res) {
  let file = req.files.profilePicture
  let filename="profile-"+req.username
  let filePath = "public/images/profile/" + filename + ".jpg"
   User.uploadingProfilePicture(filePath, file)
    .then(msg => {
      req.flash("success", msg)
      req.session.save(function () {
        res.redirect(`/profile/${req.username}`)
      })
    })
    .catch(err => {
      req.flash("errors", err)
      req.session.save(function () {
        res.redirect(`/profile/${req.username}`)
      })
    })
}
exports.uploadCoverPicture = function (req, res) {
  let file = req.files.coverPicture
  let filename="cover-"+req.username
  let filePath = "public/images/cover/" + filename + ".jpg"
   User.uploadingCoverPicture(filePath, file)
    .then(msg => {
      req.flash("success", msg)
      req.session.save(function () {
        res.redirect(`/profile/${req.username}`)
      })
    })
    .catch(err => {
      req.flash("errors", err)
      req.session.save(function () {
        res.redirect(`/profile/${req.username}`)
      })
    })
}
