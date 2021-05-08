const messageCollection = require("../db").db().collection("messages")

let Message = function (body) {
  this.message = body.message
}
Message.prototype.cleanUp = function () {
  if (typeof this.message != "string") {
    this.message = ""
  }
}
Message.prototype.sendMessage = function (user1, user2) {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanUp()
      let message = {
        from: user1,
        to: user2,
        message: this.message,
        sendDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }

      await messageCollection.findOneAndUpdate(
        {
          $or: [{ $and: [{ user1: user1 }, { user2: user2 }] }, { $and: [{ user1: user2 }, { user2: user1 }] }]
        },
        {
          $push: {
            messages: message
          }
        }
      )
      await messageCollection.findOneAndUpdate(
        {
          $or: [{ $and: [{ user1: user1 }, { user2: user2 }] }, { $and: [{ user1: user2 }, { user2: user1 }] }]
        },
        {
          $set: {
            lastDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
          }
        }
      )
      resolve()
    } catch {
      reject("There is some problem!!")
    }
  })
}
Message.getExistsRoom = function (user1, user2) {
  return new Promise((resolve, reject) => {
    messageCollection
      .findOne({
        $or: [{ $and: [{ user1: user1 }, { user2: user2 }] }, { $and: [{ user1: user2 }, { user2: user1 }] }]
      })
      .then(room => {
        resolve(room)
      })
      .catch(() => {
        console.log("there is some problem")
        reject()
      })
  })
}
Message.createRoom = function (user1, user2) {
  return new Promise((resolve, reject) => {
    let message = [
      {
        from: user1,
        to: user2,
        message: "you are connected",
        sendDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }
    ]
    let room = {
      user1: user1,
      user2: user2,
      messages: message,
      lastDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }
    messageCollection
      .insertOne(room)
      .then(info => {
        console.log("info here:", info.ops[0])
        resolve(info.ops[0])
      })
      .catch(() => {
        console.log("there is some problem")
        reject()
      })
  })
}
Message.getRooms = function (username) {
  return new Promise(async (resolve, reject) => {
    try {
      rooms = await messageCollection
        .find({ $or: [{ user1: username }, { user2: username }] })
        .sort({ lastDate: -1 })
        .toArray()
      console.log("roomes are:", rooms)
      resolve(rooms)
    } catch {
      reject()
    }
  })
}
module.exports = Message
