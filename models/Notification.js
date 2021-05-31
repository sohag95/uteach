const notificationCollection = require("../db").db().collection("notifications")
const ObjectID = require("mongodb").ObjectID
const usersCollection = require("../db").db().collection("users")

let Notification = function (data) {
  this.data = data
  this.errors = []
}
Notification.prototype.abc=function(){
  
}
Notification.sentNotification=function(sentTo,notification){
  return new Promise(async (resolve, reject) => {
    try {
      await notificationCollection.updateOne(
        { username: sentTo },
        {
          $push: {
            notifications: notification
          }
        }
      )
      await notificationCollection.updateOne(
        { username: sentTo },
        {
          $inc:{
            unseenNotificationNumber:1
          }
        }
      )
      resolve()
    } catch {
      reject()
    }
  })
}

Notification.profileSeenNotification=function(allData){
  return new Promise(async (resolve, reject) => {
    try {
      let sentTo=allData.profileOwner
      let receiverNotification=await notificationCollection.findOne({username:sentTo})
      let unseenNotifications=receiverNotification.unseenNotificationNumber
      let noNeedToNotify=false

      if(receiverNotification.notifications.length){
        let lastNotification=receiverNotification.notifications[receiverNotification.notifications.length-1]
        if(lastNotification.type=="visitedProfile" && lastNotification.data.username==allData.visitorUsername){
          let lastNotificationDate=lastNotification.createdDate
          let dateParts=lastNotificationDate.split(",")
          let firstPart=dateParts[0]
          let date = new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit"});
          if(firstPart==date){
            noNeedToNotify=true
          }
        }
      }

      if(!noNeedToNotify){
        let notification={
          type:"visitedProfile",
          data:{
            username:allData.visitorUsername,
            name:allData.visitorName
          },
          createdDate: new Date().toLocaleString([], { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
        }
        await notificationCollection.updateOne(
          { username: sentTo },
          {
            $push: {
              notifications: notification
            }
          }
        )
        await notificationCollection.updateOne(
          { username: sentTo },
          {
            $set:{
              unseenNotificationNumber:unseenNotifications+1
            }
          }
        )
        resolve()
      }else{
        console.log("No need buddy")
        resolve()
      }
    } catch {
      reject()
    }
  })
}



Notification.needTuitorNotification=function(notification,searchData,student){
  return new Promise(async (resolve, reject) => {
    try {
      let tuitors=await usersCollection.find({$and:[{"address.policeStation":searchData.policeStation},{$or:[{accountType:"studentTeacher"},{accountType:"teacher"}]}]}).toArray()
      let teachers=[]
      tuitors.forEach((tuitor)=>{
        if(student!=tuitor.username){
          teachers.push(tuitor.username)
        }
      })
    
      await notificationCollection.updateMany(
        {username:{$in:teachers}},
        {
          $push:{
          notifications:notification
        },$inc:{
            unseenNotificationNumber:1
        }},{ multi: true })

      resolve()
    } catch {
      reject()
    }
  })
}


module.exports=Notification