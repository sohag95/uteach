const Batch = require("../models/Batch")
const usersCollection = require("../db").db().collection("users")
const batchCollection = require("../db").db().collection("batches")
const homeTuitionCollection = require("../db").db().collection("homeTuition")

exports.getBatchCreationForm=function(req,res){
  res.render("batch-creation-form",{
    unseenMessages:req.unseenMessages,
    unseenNotifications:req.unseenNotifications,
  })
}

exports.getAllBatches = async function (req, res) {
  try{
  let username = req.username
  let studentPresentBatches=[]
  let teacherPresentBatches=[]
  let studentOldBatches=[]
  let teacherOldBatches=[]
  let homeTuitionAnnouncements=[]
  if (req.accountType == "student" || req.accountType=="studentTeacher") {
    let batches=await Batch.getBatchesId(username, req.accountType)
        let batchesIds = batches.map(batchId => {
          return batchId.batchId
        })
        let studentBatches = await Batch.getBatches(batchesIds)
        studentPresentBatches = studentBatches.filter(batch => {
          if (batch.presentBatch) {
            return batch
          }
        })
        studentOldBatches = studentBatches.filter(batch => {
          if (!batch.presentBatch) {
            return batch
          }
        })    
  } 
  if (req.accountType == "teacher" || req.accountType=="studentTeacher") {
      let teacherBatches = await batchCollection.find({ username: req.username }).toArray()
       homeTuitionAnnouncements = await homeTuitionCollection.find({ username: req.username }).toArray()
      teacherPresentBatches = teacherBatches.filter(batch => {
        if (batch.presentBatch) {
          return batch
        }
      })
      teacherOldBatches = teacherBatches.filter(batch => {
        if (!batch.presentBatch) {
          return batch
        }
      })
    } 
    let batches={
        studentBatches:{
          presentBatches:studentPresentBatches,
          oldBatches:studentOldBatches
        },
        teacherBatches:{
          presentBatches:teacherPresentBatches,
          oldBatches:teacherOldBatches,
          announcements:homeTuitionAnnouncements
        }
    }
      res.render("batches", {
        myActiveConnections:req.myActiveConnections,
        unseenMessages:req.unseenMessages,
        unseenNotifications:req.unseenNotifications,
        accountType: req.accountType,
        batches:batches
      })
    }catch{
      res.render("404")
    }
  
}

exports.batchCreate = function (req, res) {
  let batch = new Batch(req.body, req.username, undefined, req.name)
  batch
    .batchCreate()
    .then(function () {
      req.flash("success", "New batch successfully created.")
      req.session.save(() => res.redirect("/batches"))
    })
    .catch(function (errors) {
      req.flash("errors", errors)
      req.session.save(() => res.redirect("/batches"))
    })
}

exports.getBatchEditForm = function (req, res) {
  if(req.batch.username==req.username){
    let editableData={
      batchId:req.batch._id,
      stream:req.batch.stream,
      class:req.batch.class,
      subjects:req.batch.subjects,
      days:req.batch.days,
      classTime:req.batch.classTime,
      session:req.batch.session,
      studentsQuentity:req.batch.studentsQuentity,
      address:req.batch.address,
      nearBy:req.batch.nearBy,
      expirationDate:req.batch.expirationDate,
      batchMood:req.batch.batchMood,
      nearBy:req.batch.nearBy
    }
    res.render("batch-edit-form",{
      editableData:editableData
    })
  }else{
    req.flash("errors", "You have no permission to visite that page!!")
    req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
  }
}


exports.editBatch = function (req, res) {
  if(req.batch.username==req.username){
  let batch = new Batch(req.body)
  batch
    .editBatch(req.batch._id)
    .then(function () {
      req.flash("success", "Batch data successfully updated.")
      req.session.save(() => res.redirect(`/batch/${req.batch._id}/edit`))
    })
    .catch(function () {
      batch.errors.forEach(function(error) {
        req.flash("errors", error)
      })
      req.session.save(() => res.redirect(`/batch/${req.batch._id}/edit`))
    })
  }else{
    req.flash("errors", "You have no permission to perform that action!!")
    req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
  }
}


exports.updateOnlineDetails = function (req, res) {
  if(req.batch.username==req.username){
    if(req.batch.batchMood=="online"){
      let batch = new Batch(req.body)
      batch
        .editOnlineClassDetails(req.batch._id)
        .then(function () {
          req.flash("success", "Online class details successfully updated.")
          req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
        })
        .catch(function () {
          batch.errors.forEach(function(error) {
            req.flash("errors", error)
          })
          req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
        })
    }else{
      req.flash("errors", "This batch is in Offline-mode.First convert the batch into online mode!!")
      req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
    }
  }else{
    req.flash("errors", "You have no permission to perform that action!!")
    req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
  }
}

exports.ifBatchExists = function (req, res, next) {
  Batch.findSingleBatchById(req.params._id)
    .then(function (batch) {
      req.batch = batch
      next()
    })
    .catch(function () {
      console.log("i am here")
      res.render("404")
    })
}

exports.sentRequest = async function (req, res) {
  if (req.username != req.batch.username) {
    let appliedStudents = req.batch.appliedStudents
    let admittedStudents = req.batch.admittedStudents
    let notApplied = true
    let notAdmitted = true
    appliedStudents.forEach(username => {
      if (username.username == req.username) {
        notApplied = false
      }
    })
    admittedStudents.forEach(username => {
      if (username.username == req.username) {
        notAdmitted = false
      }
    })
    if (notApplied && notAdmitted) {
      Batch.sentRequest(req.username, req.batch._id, req.batch.username, req.name)
        .then(function () {
          req.flash("success", "Your request successfully added.")
          req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
        })
        .catch(function () {
          req.flash("errors", "There is some problem")
          req.session.save(() => res.redirect("/"))
        })
    } else {
      if (!notAdmitted) {
        req.flash("errors", "You are already a student of this batch.")
      } else {
        req.flash("errors", "You have already send request for this batch .")
      }
      req.session.save(() => res.redirect("/"))
    }
  } else {
    req.flash("errors", "You can't apply for your own batch.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.getSingleBatch = async function (req, res) {
  try {
    let batchOwner = false
    if (req.batch.username == req.username) {
      batchOwner = true
    }
    res.render("single-batch-screen", { 
      unseenMessages:req.unseenMessages,
      unseenNotifications:req.unseenNotifications,
      batch: req.batch, 
      batchOwner: batchOwner 
    })
  } catch {
   
    res.render("404")
  }
}

exports.acceptRequest = async function (req, res) {
  try {
    let present = false
    let studentUsername = req.body.studentUsername
    let studentName = req.body.studentName
    let requestedOn=req.body.requestedOn
    req.batch.appliedStudents.forEach(student => {
      if (student.username == studentUsername) {
        present = true
      }
    })
    //student's account present or not
    let studentPresent = await usersCollection.findOne({ username: studentUsername })
    let accountType = studentPresent.accountType
    let student = false
    if (accountType == "student" || accountType == "studentTeacher") {
      student = true
    }
    //if really user requested or not on this batch... checking

    if (present && studentPresent && student) {
      if (req.batch.username == req.username) {
        let batch = new Batch()
        batch
          .acceptRequest(req.batch, studentUsername, studentName,requestedOn)
          .then(function () {
            req.flash("success", "Request accepted successfully.")
            req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
          })
          .catch(function (errors) {
            req.flash("errors", errors)
            req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
          })
      } else {
        req.flash("errors", "You dont have permission to perform that actiuon.")
        req.session.save(() => res.redirect("/"))
      }
    } else {
      req.flash("errors", "No request found with this profile /user profile has been deleted/You already accepted his/her request / You are not a student.")
      req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
    }
  } catch {
    res.render("404")
  }
}

exports.deleteRequest = async function (req, res) {
  try {
    let present = false
    let studentUsername = req.body.studentUsername
    let studentName = req.body.studentName
    let requestedOn=req.body.requestedOn
    req.batch.appliedStudents.forEach(student => {
      if (student.username == studentUsername) {
        present = true
      }
    })

    if (present) {
      if (req.batch.username == req.username) {
        let batch = new Batch()
        batch
          .deleteRequest(req.batch, studentUsername, studentName,requestedOn)
          .then(function () {
            req.flash("success", "Request deleted successfully.")
            req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
          })
          .catch(function (errors) {
            req.flash("errors", errors)
            req.session.save(() => res.redirect("/batches"))
          })
      } else {
        req.flash("errors", "You dont have permission to perform that actiuon.")
        req.session.save(() => res.redirect("/"))
      }
    } else {
      req.flash("errors", "No request found with this profile /user profile has been deleted/You already accepted his/her request / You are not a student.")
      req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
    }
  } catch {
    res.render("404")
  }
}

exports.deleteStudent = async function (req, res) {
  try {
    let present = false
    let studentUsername = req.body.studentUsername
    let studentName = req.body.studentName
    let joinedOn=req.body.joinedOn
    req.batch.admittedStudents.forEach(student => {
      if (student.username == studentUsername) {
        present = true
      }
    })

    //if really user student on this batch... checking
    if (present) {
      if (req.batch.username == req.username) {
        let batch = new Batch()
        batch
          .deleteStudentFromBatch(req.batch, studentUsername, studentName,joinedOn)
          .then(function () {
            req.flash("success", "Student deleted successfully from the batch.")
            req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
          })
          .catch(function (errors) {
            req.flash("errors", errors)
            req.session.save(() => res.redirect("/batches"))
          })
      } else {
        req.flash("errors", "You do not have permission to perform that actiuon.")
        req.session.save(() => res.redirect("/"))
      }
    } else {
      req.flash("errors", "No admitted student found with this profile /user profile has been deleted/You have already deleted his/her profile.")
      req.session.save(() => res.redirect(`/viewSingleBatch/${req.batch._id}`))
    }
  } catch {
    res.render("404")
  }
}
