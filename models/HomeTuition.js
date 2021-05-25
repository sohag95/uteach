const homeTuitionCollection = require("../db").db().collection("homeTuition")
const usersCollection = require("../db").db().collection("users")
const sanitizeHTML = require("sanitize-html")
const ObjectID = require("mongodb").ObjectID

let HomeTuition = function (data, username, teacherName) {
  this.data = data
  this.errors = []
  this.username = username
  this.teacher = teacherName
}


HomeTuition.prototype.cleanUp = function () {
  if (typeof this.data.stream != "string") {
    this.data.stream = ""
  }
  if (typeof this.data.class != "string") {
    this.data.class = ""
  }
  if (typeof this.data.subjectName != "string") {
    this.data.subjectName = ""
  }

  if (typeof this.data.district != "string") {
    this.data.district = ""
  }
  if (typeof this.data.policeStation != "string") {
    this.data.policeStation = ""
  }
  if (typeof this.data.salery != "string") {
    this.data.salery = ""
  }
  if (typeof this.data.postOffice != "string") {
    this.data.postOffice = ""
  }
  this.data = {
    username: this.username,
    teacherName: this.teacher,
    stream: sanitizeHTML(this.data.stream.trim(), { allowedTags: [], allowedAttributes: {} }),
    class: sanitizeHTML(this.data.class.trim(), { allowedTags: [], allowedAttributes: {} }),
    subjectName: sanitizeHTML(this.data.subjectName.trim(), { allowedTags: [], allowedAttributes: {} }),
    salery:sanitizeHTML(this.data.salery.trim(), { allowedTags: [], allowedAttributes: {} }),
    address:{
      district: sanitizeHTML(this.data.district.trim(), { allowedTags: [], allowedAttributes: {} }),
      policeStation: sanitizeHTML(this.data.policeStation.trim(), { allowedTags: [], allowedAttributes: {} }),
      postOffice: sanitizeHTML(this.data.postOffice.trim(), { allowedTags: [], allowedAttributes: {} }),
    },
    announcementViewed:0,
    presentAnnouncement: true,
    createdDate: new Date()
  }

  // get rid of any bogus properties
}

HomeTuition.prototype.validate = function () {
  if (this.data.stream == "") {
    this.errors.push("You must select stream.")
  }
  if (this.data.subjectName == "") {
    this.errors.push("You must provide subject name.")
  }
  if (this.data.class == "") {
    this.errors.push("You must select class.")
  }
  if (this.data.salery == "") {
    this.errors.push("You must provide your expeced salery amount.")
  }
  if (this.data.district == "") {
    this.errors.push("You must select district name.")
  }
  if (this.data.policeStation == "") {
    this.errors.push("You must select your area name.")
  }
  if (this.data.postOffice == "") {
    this.errors.push("You must select near by post office.")
  }
}

HomeTuition.prototype.createAnnouncement = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // save batch into database
      homeTuitionCollection
        .insertOne(this.data)
        .then(async info => {
          try {
            let homeTuitionId = {
              homeTuitionId: info.ops[0]._id
            }
            //updating batches on teacher's database
            await usersCollection.updateOne(
              { username: this.data.username },
              {
                $push: {
                  "teacherData.homeTuitionAnnouncements":homeTuitionId
                }
              }
            )
            resolve(homeTuitionId.homeTuitionId)
          } catch {
            this.errors.push("not updating on array.")
            reject(this.errors)
          }
        })
        .catch(() => {
          this.errors.push("Please try again later.")
          reject(this.errors)
        })
    } else {
      reject(this.errors)
    }
  })
}

HomeTuition.findSingleAnnouncementById = function (tuitionId) {
  return new Promise(function (resolve, reject) {
    if (typeof tuitionId != "string") {
      reject()
      return
    }
    homeTuitionCollection
      .findOne({ _id: new ObjectID(tuitionId) })
      .then(function (tuition) {
        resolve(tuition)
      })
      .catch(function () {
        reject()
      })
  })
}
HomeTuition.prototype.stopAnnouncement = function (tuitionId) { 
  return new Promise(async(resolve, reject)=> {
    try{
      let stop=false
      await homeTuitionCollection.findOneAndUpdate(
        { _id: new ObjectID(tuitionId) },
        {$set: {
            presentAnnouncement:stop
          }
        }
      )
      resolve()
    }catch{
      reject("There is some problem!!")
    }
    
  })
}
HomeTuition.restartAnnouncement = function (tuitionId) { 
  return new Promise(async(resolve, reject)=> {
    try{
      let start=true
      await homeTuitionCollection.findOneAndUpdate(
        { _id: new ObjectID(tuitionId) },
        {
          $set: {
            presentAnnouncement:start
          }
        }
      )
      resolve()
    }catch{
      reject("There is some problem!!")
    }
    
  })
}
HomeTuition.deleteAnnouncement = function (tuitionId) { 
  return new Promise(async(resolve, reject)=> {
    try{
      await homeTuitionCollection.deleteOne({ _id: new ObjectID(tuitionId) })
      resolve()
    }catch{
      reject("There is some problem!!")
    }
    
  })
}
HomeTuition.announcementViewed=function(tuitionData,visitorUsername,visitorName){
  return new Promise(async(resolve, reject)=> {
    try{
      let announcementViewed=tuitionData.announcementViewed+1
      
      let notification = {
        type:"announcementViewed",
        seen: false,
        message: visitorName + " just viewed one of your home tuition announcements.Visit his/her profile to contact with him/her.",
        visitorUsername:visitorUsername,
        announcementId: tuitionData._id,
        createdDate: new Date()
      }

      await usersCollection.updateOne(
        { username: tuitionData.username },
        {
          $push: {
            notifications: notification
          }
        }
      )

      await homeTuitionCollection.findOneAndUpdate(
        { _id: new ObjectID(tuitionData._id) },
        {
          $set: {
            announcementViewed:announcementViewed
          }
        }
      )
      resolve()
    }catch{
      reject("There is some problem!!")
    }
    
  })
}
module.exports = HomeTuition