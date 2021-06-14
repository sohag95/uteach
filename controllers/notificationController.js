const notificationCollection = require("../db").db().collection("notifications")
exports.unseenNotificationNumber=async function(req,res,next){
  try{
    if(req.username){
      let notificationRoom = await notificationCollection.findOne({username:req.username})
      req.unseenNotifications=notificationRoom.unseenNotificationNumber
      next()
    }else{
      next()
    }
  }catch{
    console.log("Problem here!!")
    res.render("404")
  }
}

exports.getNotifications = async function (req, res) {
  try {
    let notificationRoom = await notificationCollection.findOne({username:req.username})
    await notificationCollection.findOneAndUpdate(
      {username: req.username},
     {$set: {
            unseenNotificationNumber: 0
            }
      })
    let notifications=notificationRoom.notifications.reverse().slice(0,30)
    res.render("notifications", {
      myActiveConnections:req.myActiveConnections,
      unseenNotifications:req.unseenNotifications,
      unseenMessages:req.unseenMessages,
      notifications: notifications
    })
  } catch {
    res.render("404")
  }
}