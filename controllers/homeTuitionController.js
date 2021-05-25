const HomeTuition = require("../models/HomeTuition")
const usersCollection = require("../db").db().collection("users")
const batchCollection = require("../db").db().collection("batches")


exports.getHomeTuitionAnnouncementForm=function(req,res){
  res.render("home-tuition-creation-form")
}

exports.createAnnouncement = function (req, res) {
  console.log(req.body)
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
      console.log("Tuition data:",tuition)
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
            console.log("i am here buddy")
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
            console.log("i am here buddy")
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
            console.log("i am here buddy")
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
    if(req.tuition.username!=req.username){
      await HomeTuition.announcementViewed(req.tuition,req.username,req.name)
    }
    let tuitor=await usersCollection.findOne({username:tuitionAnnouncement.username})
    let tuitorData={
      gender:tuitor.gender,
      phone:tuitor.phone,
      email:tuitor.email
    }
    console.log("announcement data",tuitionAnnouncement)
    console.log("tuitor data",tuitorData)
    
    res.render("single-announcement-details",{
      tuitorData:tuitorData,
      announcementData:tuitionAnnouncement
    })
  } catch {
    res.render("404")
  }
}