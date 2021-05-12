const Operations = require("../models/Operations")
const Rating = require("../models/Rating")


exports.giveRating = function (req, res) {
      try{
        console.log("Username",req.params.username)
        console.log("rating given :",req.body)
        let rating=new Rating(req.body,req.username,req.name)
        rating.giveRating(req.params.username).then(()=>{
          req.flash("success", "Your rating successfully added.Thank you for your support!!")
          req.session.save(() => res.redirect(`/profile/${req.params.username}`))      
        }).catch((err)=>{
          err.forEach(function (e) {
            req.flash("errors", e)
          })
          req.session.save(function () {
            res.redirect(`/profile/${req.params.username}`)
          })
        })
      }catch{
        res.render("404")
      }   
}
exports.isStudentOfTheTeacher =function (req, res, next) {
  if(req.profileUser.accountType=="teacher" || req.profileUser.accountType=="studentTeacher"){
    let operation=new Operations(req.profileUser.username,req.profileUser.accountType)
    operation.teacherConnections().then((connections)=>{
      let student=false
      connections.allStudents.forEach((stu)=>{
        if(stu.username==req.username){
          student=true
        }
      })
      if(student){
        next()
      }else{
        req.flash("errors", "Only teacher's student can give rating!!.")
        req.session.save(() => res.redirect(`/profile/${req.username}`))    
      }
    }).catch(()=>{
      console.log("I am here now!")
      res.render("404")
    })
  }else{
    req.flash("errors", "Whome you rated,not a teacher!!.")
    req.session.save(() => res.redirect(`/profile/${req.username}`))

  }
}

exports.firstRating =function (req, res, next) {
  let allRatings=req.profileUser.rating
  let ratingGiven=false
  console.log("Ratted by:",allRatings.givenBy)
  allRatings.givenBy.forEach((given)=>{
    if(given.username==req.username){
      ratingGiven=true
    }
  })
  if(!ratingGiven){
    next()
  }else{
    req.flash("errors", "You can not rate twice.")
    req.session.save(() => res.redirect(`/profile/${req.params.username}`))

  }
}