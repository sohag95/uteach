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
        sendDate:  new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
      }
      let room=await messageCollection
      .findOne({
        $or: [{ $and: [{ user1: user1 }, { user2: user2 }] }, { $and: [{ user1: user2 }, { user2: user1 }] }]
      })
      let unSeenBy
      let unseenValue
      let user1unseenValue=Number(room.user1unseen)
      let user2unseenValue=Number(room.user2unseen)
      if(room.user1==user1){
        unSeenBy="user2unseen"
        unseenValue=user2unseenValue+1
      }else{
        unSeenBy="user1unseen"
        unseenValue=user1unseenValue+1
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
            [unSeenBy]:unseenValue,
            lastDate: new Date()
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

Message.messageSeenBy = function (user1, user2) {
  
  return new Promise(async(resolve, reject) => {
    try{
    let room=await messageCollection
      .findOne({
        $or: [{ $and: [{ user1: user1 }, { user2: user2 }] }, { $and: [{ user1: user2 }, { user2: user1 }] }]
      })
      let seenBy
      if(room.user1==user1){
        seenBy="user1unseen"
      }else{
        seenBy="user2unseen"
      }
      await messageCollection.findOneAndUpdate(
        {
          $or: [{ $and: [{ user1: user1 }, { user2: user2 }] }, { $and: [{ user1: user2 }, { user2: user1 }] }]
        },
        {
          $set: {
            [seenBy]:0
          }
        }
      )
      resolve()
    }catch{
      reject()
    }
  })

}
//new Date.toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
Message.createRoom = function (user1,user1name,user2,user2name) {
  return new Promise((resolve, reject) => {
    let message =[ {
      from: user1,
      to: user2,
      message: "hi",
      sendDate:  new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    }]
    let room = {
      user1: user1,
      user1name:user1name,
      user2: user2,
      user2name:user2name,
      user1unseen:0,
      user2unseen:1,
      messages: message,
      lastDate: new Date()
    }
    messageCollection
      .insertOne(room)
      .then(info => {
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
      resolve(rooms)
    } catch {
      reject()
    }
  })
}
module.exports = Message
