const Message = require("../models/Message")


exports.unseenMessageNumber=async function(req,res,next){
  try{
    if(req.username){
      let rooms = await Message.getRooms(req.username)
      let unseenMessages=0
      rooms.forEach((room)=>{
        if(room.user1==req.username){
          unseenMessages+=room.user1unseen
        }else{
          unseenMessages+=room.user2unseen
        }
      })
      req.unseenMessages=unseenMessages
      next()
    }else{
      next()
    }
  }catch{
    console.log("Problem here!!")
    res.render("404")
  }
}

exports.getMessagesRoom = async function (req, res) {
  try {
    let rooms = await Message.getRooms(req.username)
    res.render("messages", {
      myActiveConnections:req.myActiveConnections,
      unseenMessages:req.unseenMessages,
      unseenNotifications:req.unseenNotifications,
      rooms: rooms
    })
  } catch {
    console.log("Problem here!!!!")
    res.render("404")
  }
}
exports.getSingleRoom = async function (req, res) {
  try {
    let messageRoom={}
    let isConnected=req.allConnections.includes(req.params.username)
    if(isConnected){
      let room = await Message.getExistsRoom(req.username, req.params.username)
      if (room) {
        await Message.messageSeenBy(req.username,req.params.username)
        messageRoom = room
      } else {
        let createRoom = await Message.createRoom(req.username,req.name, req.params.username,req.profileUser.name)
        messageRoom = createRoom
      }
      let messageTo={
        username:req.profileUser.username,
        name:req.profileUser.name
      }
      res.render("single-chat", {
        myActiveConnections:req.myActiveConnections,
        unseenMessages:req.unseenMessages,
        unseenNotifications:req.unseenNotifications,
        messageRoom: messageRoom,
        messageTo: messageTo,
      })
    }else{
      req.flash("errors", "Sorry you are not connected with him/her.So you have no permition to sent message.")
      req.session.save(function() {
        res.redirect("/user-home")
      })
    }
  } catch {
    console.log("this line executed.")
    res.render("404")
  }
}
exports.sendMessage = function (req, res) {
  try {
    let message = new Message(req.body)
    message
      .sendMessage(req.username, req.params.username)
      .then(() => {
        res.redirect(`/single-chat/${req.params.username}`)
      })
      .catch(e => {
        req.flash("errors", e)
        req.session.save(function () {
          res.redirect(`/single-chat/${req.params.username}`)
        })
      })
  } catch {
    console.log("Problem here!!")
    res.render("404")
  }
}
