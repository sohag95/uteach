const User = require("../models/User")
const Batch = require("../models/Batch")
const usersCollection = require("../db").db().collection("users")
const batchCollection = require("../db").db().collection("batches")

let Operations = function (username,accountType) {
this.username=username
this.accountType=accountType
}

Operations.prototype.removeDuplicates = function (originalArray, prop) {
  var newArray = []
  var lookupObject = {}
  for (var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i]
  }
  for (i in lookupObject) {
    newArray.push(lookupObject[i])
  }
  return newArray
}


//posted photos id creation
Operations.makeid = function () {
  var result           = [];
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 7; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * 
    charactersLength)));
  }
  let id=""
  for ( var i = 0; i < 7; i++ ) {
    id=id+result[i]
  }
  return id;
}


Operations.shuffle = function (array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


Operations.prototype.getConnections=function(){
  return new Promise(async(resolve, reject) => {
    try{
    let studentConnections=[]
    let teacherConnections=[]
    let connections
    if(this.accountType=="student" || this.accountType=="studentTeacher"){
      studentConnections=await this.studentConnections()
    }
    if(this.accountType=="teacher" || this.accountType=="studentTeacher"){
      teacherConnections=await this.teacherConnections()
    }
    connections={
      studentConnections:studentConnections,
      teacherConnections:teacherConnections
    }
    resolve(connections)
  }catch{
    reject()
  }
  })
}


Operations.prototype.studentConnections=function(){
  return new Promise(async(resolve, reject) => {
    try{
    let allFriends = []
    let allTeachers=[]
    let user=await usersCollection.findOne({username:this.username})
      let batchesId = user.studentData.allBatchesTaken
      let batchesIds = batchesId.map(batchId => {
        return batchId.batchId
      })
      let studentBatches = await Batch.getBatches(batchesIds)
      studentBatches.forEach(batch => {
        batch.admittedStudents.forEach(student => {
          if (student.username != this.username) {
            allFriends.push(student)
          }
        })
      })
      allTeachers = studentBatches.map(batch => {
        let teacher = {
          name: batch.teacherName,
          username: batch.username,
        }
        return teacher
      })
      allFriends=this.removeDuplicates(allFriends, "username")
      allTeachers=this.removeDuplicates(allTeachers, "username")
      let allConnections = {
        allFriends:allFriends,
        allTeachers:allTeachers
      }
    resolve(allConnections)
    }catch{
      reject()
    }
  })
}


Operations.prototype.teacherConnections=function(){
  return new Promise(async(resolve, reject) => {
    try{
    let allStudents = []
      let teacherBatches = await batchCollection.find({ username: this.username }).sort({ createdDate: -1 }).toArray()
      teacherBatches.forEach(batch => {
        batch.admittedStudents.forEach(student => {
          allStudents.push(student)
        })
      })
      let students = this.removeDuplicates(allStudents, "username")
      let allConnections={
        allStudents:students
      }
      resolve(allConnections)
    }catch{
      reject()
    }
  })
}
module.exports = Operations
