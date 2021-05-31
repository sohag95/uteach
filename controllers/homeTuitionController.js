const HomeTuition = require("../models/HomeTuition")
const usersCollection = require("../db").db().collection("users")
const needHomeTuitorCollection=require("../db").db().collection("needHomeTuitor")


exports.getHomeTuitionAnnouncementForm=function(req,res){
  res.render("home-tuition-creation-form",{
    unseenMessages:req.unseenMessages,
    unseenNotifications:req.unseenNotifications,
  })
}

exports.createAnnouncement = function (req, res) {

  let homeTuition = new HomeTuition(req.body, req.username , req.name)
  homeTuition
    .createAnnouncement()
    .then(function () {
      req.flash("success", "New Announcement for home-tuition successfully created.")
      req.session.save(() => res.redirect("/batches"))
    })
    .catch(function (errors) {
      req.flash("errors", errors)
      req.session.save(() => res.redirect("/batches"))
    })
}

exports.ifAnnouncementExists = function (req, res, next) {
  HomeTuition.findSingleAnnouncementById(req.params._id)
    .then(function (tuition) {
      
      req.tuition = tuition
      next()
    })
    .catch(function () {
      res.render("404")
    })
}


exports.stopAnnouncement = function (req, res) {
  try {
    if (req.tuition.presentAnnouncement) {
      if (req.tuition.username == req.username) {
        let homeTuition=new HomeTuition()
        homeTuition.stopAnnouncement(req.tuition._id)
          .then(function () {
            
            req.flash("success", "Announcement Stopped Successfully.")
            req.session.save(() => res.redirect("/batches"))
          })
          .catch(function (errors) {
            req.flash("errors", "there is some problem")
            req.session.save(() => res.redirect("/batches"))
          })
      } else {
        req.flash("errors", "You dont have permission to perform that action.")
        req.session.save(() => res.redirect("/"))
      }
    } else {
      req.flash("errors", "Announcement has already stopped.")
      req.session.save(() => res.redirect("/batches"))
    }
  } catch {
    res.render("404")
  }
}

exports.restartAnnouncement = function (req, res) {
  try {
    if (!req.tuition.presentAnnouncement) {
      if (req.tuition.username == req.username) {
        HomeTuition.restartAnnouncement(req.tuition._id)
          .then(function () {
           
            req.flash("success", "Announcement re-started Successfully.")
            req.session.save(() => res.redirect("/batches"))
          })
          .catch(function (errors) {
            req.flash("errors", errors)
            req.session.save(() => res.redirect("/batches"))
          })
      } else {
        req.flash("errors", "You dont have permission to perform that action.")
        req.session.save(() => res.redirect("/"))
      }
    } else {
      req.flash("errors", "Announcement is already running.")
      req.session.save(() => res.redirect("/batches"))
    }
  } catch {
    res.render("404")
  }
}

exports.deleteAnnouncement = function (req, res) {
  try {
      if (req.tuition.username == req.username) {
        HomeTuition.deleteAnnouncement(req.tuition._id)
          .then(function () {
            
            req.flash("success", "Announcement successfully deleted.")
            req.session.save(() => res.redirect("/batches"))
          })
          .catch(function (errors) {
            req.flash("errors", errors)
            req.session.save(() => res.redirect("/batches"))
          })
      } else {
        req.flash("errors", "You dont have permission to perform that action.")
        req.session.save(() => res.redirect("/"))
      }
  } catch {
    res.render("404")
  }
}


exports.getSingleAnnouncementDetails =async function (req, res) {
  try {
    let tuitionAnnouncement=req.tuition
    let tuitorUsername=req.tuition.username
    if(tuitorUsername!=req.username){
      await HomeTuition.announcementViewed(req.tuition,req.username,req.name)
    }
    let tuitor=await usersCollection.findOne({username:tuitorUsername})
    let tuitorData={
      gender:tuitor.gender,
      phone:tuitor.phone,
      email:tuitor.email
    }
   
    res.render("single-announcement-details",{
      unseenMessages:req.unseenMessages,
      unseenNotifications:req.unseenNotifications,
      tuitorData:tuitorData,
      announcementData:tuitionAnnouncement
    })
  } catch {
    res.render("404")
  }
}




// ###############STUDENT ANNOUNCEMENT RELATED FUNCTIONS#############


exports.needHomeTuitor =async function (req, res) {
  try {
    let studentAnnouncements=await needHomeTuitorCollection.find({username:req.username}).toArray()
    
    res.render("need-home-tuitor",{
      myActiveConnections:req.myActiveConnections,
      unseenMessages:req.unseenMessages,
      unseenNotifications:req.unseenNotifications,
      studentAnnouncements:studentAnnouncements
    })
  } catch {
    res.render("404")
  }
}

exports.needHomeTuitorAnnouncement = function (req, res) {
  
  let homeTuition = new HomeTuition(req.body, req.username , req.name)
  homeTuition
    .createStudentAnnouncement()
    .then(function () {
      req.flash("success", "New Announcement for home-tuitor successfully created.")
      req.session.save(() => res.redirect("/need-home-tuitor"))
    })
    .catch(function (errors) {
      req.flash("errors", errors)
      req.session.save(() => res.redirect("/need-home-tuitor"))
    })
}

exports.ifNeedTeacherAnnouncementExists = function (req, res, next) {
  HomeTuition.findSingleNeedTuitorAnnouncementById(req.params._id)
    .then(function (announcement) {
     
      req.announcement = announcement
      next()
    })
    .catch(function () {
      res.render("404")
    })
}

exports.getSingleNeedTuitorAnnouncementDetails =async function (req, res) {
  try {
    let announcement=req.announcement
    let studentUsername=announcement.username
    if(studentUsername!=req.username){
      await needHomeTuitorCollection.findOneAndUpdate(
        { _id: new ObjectID(announcement._id) },
        {
          $inc: {
            announcementViewed:1
          }
        }
      )
    }
    let student=await usersCollection.findOne({username:studentUsername})
    let studentData={
      gender:student.gender,
      phone:student.phone,
      email:student.email
    }
   
    res.render("need-home-tuitor-announcement",{
      unseenMessages:req.unseenMessages,
      unseenNotifications:req.unseenNotifications,
      studentData:studentData,
      announcementData:announcement
    })
  } catch {
    res.render("404")
  }
}

exports.deleteNeedTuitorAnnouncement = function (req, res) {
  try {
      if (req.announcement.username == req.username) {
        HomeTuition.deleteNeedTuitorAnnouncement(req.announcement._id)
          .then(function () {
            
            req.flash("success", "Announcement successfully deleted.")
            req.session.save(() => res.redirect("/need-home-tuitor"))
          })
          .catch(function (errors) {
            req.flash("errors", errors)
            req.session.save(() => res.redirect("/need-home-tuitor"))
          })
      } else {
        req.flash("errors", "You dont have permission to perform that action.")
        req.session.save(() => res.redirect("/"))
      }
  } catch {
    res.render("404")
  }
}