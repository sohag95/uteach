const BatchMessage = require('../models/BatchMessage')


exports.sentMessage = function(req, res) {
    let message = new BatchMessage(req.body,req.username,req.name,req.batch)
    message.sentMessage().then(()=> {
       res.redirect(`/group-chat/${req.batch._id}`)
    }).catch(function(errors) {
      errors.forEach(error => req.flash("errors", error))
      req.session.save(() => res.redirect(`/group-chat/${req.batch._id}`))
    })
  }

  exports.getMessages=function(req,res){
     let groupMessages=req.batch.groupMessages
     res.render('group-chat',{
      unseenMessages:req.unseenMessages,
      unseenNotifications:req.unseenNotifications,
       messages:groupMessages,
       batchData:req.batch
      })
  }

  exports.ifBatchStudent = function (req, res, next) {
    let admittedStudents = req.batch.admittedStudents
    let admitted = false
    admittedStudents.forEach(user => {
      if (user.username == req.username) {
        admitted = true
      }
    })
    if(req.username==req.batch.username){
      admitted=true
    }
    if(admitted){
      next()
    }else{
      req.flash("errors", "You don't have permission to enter on that room!!")
      res.redirect("/user-home")
    }
  }
  