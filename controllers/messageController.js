const Message = require("../models/Message")
const messageCollection = require("../db").db().collection("messages")

exports.getMessagesRoom = async function (req, res) {
  try {
    let rooms = await Message.getRooms(req.username)
    res.render("messages", {
      rooms: rooms
    })
  } catch {
    res.render("404")
  }
}
exports.getSingleRoom = async function (req, res) {
  try {
    let messageTo = req.params.username
    let messages = []

    let room = await Message.getExistsRoom(req.username, req.params.username)
    console.log("room here:", room)
    if (room) {
      messages = room.messages
    } else {
      let createRoom = await Message.createRoom(req.username, req.params.username)
      messages = createRoom.messages
    }

    res.render("single-chat", {
      messages: messages,
      messageTo: messageTo
    })
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
    res.render("404")
  }
}
