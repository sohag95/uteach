const Password = require("../models/Password")

exports.changePassword = function (req, res) {
  if (req.body.passwordNew1 == req.body.passwordNew2) {
    let password = new Password(req.body)
    password
      .changePassword(req.username)
      .then(() => {
        req.flash("success", "You have successfully updated your new password.")
        req.session.save(function () {
            res.redirect(`/profile/${req.username}/edit`)
        })
      })
      .catch(e => {
        req.flash("errors", e)
        req.session.save(function () {     
            res.redirect(`/profile/${req.username}/edit`)    
        })
      })
  } else {
    req.flash("errors", "Your new passwords are not matching.Enter again.....")
    req.session.save(function () {
        res.redirect(`/profile/${req.username}/edit`)
    })
  }
}
