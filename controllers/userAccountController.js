const UserAccount = require("../models/UserAccount")

exports.ifUserStudent = function (req, res, next) {
  UserAccount.ifUserStudent(req.username)
    .then(function () {
      next()
    })
    .catch(function () {
        res.render("404")
    })
}
exports.getUpgradeAccountForm=function(req,res){
  res.render("upgrade-account-form",{
    unseenMessages:req.unseenMessages,
    unseenNotifications:req.unseenNotifications,
  })
}
exports.upgradeAccount = function (req, res) {
  let userAccount = new UserAccount(req.body)
  userAccount
    .upgradeAccount(req.username)
    .then(() => {
      //set the session data again because accound type had to change "student" to "studentTeacher"
      req.session.user = { username: req.session.user.username, name: req.session.user.name, accountType: "studentTeacher" }
      req.flash("success", "Successfully upgraded your account as a teacher.")
      req.session.save(function () {
        res.redirect(`/profile/${req.username}`)
      })
    })
    .catch(regErrors => {
      regErrors.forEach(function (error) {
        req.flash("errors", error)
      })
      req.session.save(function () {
        res.redirect("/upgradeAccount-form")
      })
    })
}
