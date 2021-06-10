const feedbackCollection = require("../db").db().collection("feedbacks")
const Feedback = require("../models/Feedback")

exports.getFeedback = function (req, res) {
  let feedback = new Feedback(req.body, req.username,req.name)
  feedback
    .getFeedback()
    .then(function () {
      req.flash("success", "Thank you so much for your feedback.")
        req.session.save(() => res.redirect("/user-home"))
    })
    .catch(function (errors) {
      req.flash("errors", errors)
        req.session.save(() => res.redirect("/feedback"))
    })
}

exports.getFeedbackForm =async function (req, res) {
  try{
    let feedbackGiven=false
    let given=await feedbackCollection.findOne({username:req.username})
    if(given){
      feedbackGiven=true
    }
    res.render("feedback-form",{
      regErrors: req.flash("regErrors"),
      feedbackGiven:feedbackGiven
    })
  }catch{

  }
 
}