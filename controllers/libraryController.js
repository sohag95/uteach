const Library = require("../models/Library")
const libraryCollection = require("../db").db().collection("library")


exports.getLibraryData =async function (req, res) {
  try{
    let textNotes=[]
    let webLinkNotes=[]
    let library=await libraryCollection.findOne({username:req.username})
    if(library){
      let index=0
    library.libraryItems.forEach((note)=>{
      note={
        index:index,
        noteType:note.noteType,
        about:note.about,
        content:note.content,
        createdDate:note.createdDate
      }
      if(note.noteType=="text"){
        textNotes.push(note)
      }else if(note.noteType=="webLink"){
        webLinkNotes.push(note)
      }
      index+=1
    })
  }
   
    res.render("library",{
      myActiveConnections:req.myActiveConnections,
      unseenMessages:req.unseenMessages,
      unseenNotifications:req.unseenNotifications,
      textNotes:textNotes,
      webLinkNotes:webLinkNotes
    })
  }catch{
    res.render("404")
  }
}


exports.addNote = function (req, res) {
  try{
    let library=new Library(req.body,req.username)
    library.addNote().then(()=>{
      req.flash("success", "New note successfully added.")
      req.session.save(() => res.redirect("/library"))
    }).catch((errors)=>{
      errors.forEach(function(error) {
        req.flash("errors", error)
      })
      req.session.save(function() {
        res.redirect("/library")
      })
    }) 
  }catch{
    res.render("404")
  }
}

exports.getEditNotePage =async function (req, res) {
  try{
    let itemData=await Library.getEditItemData(req.username,req.params.index)
    if(itemData=="notFound"){
      res.render("404")
    }else{
      itemData.index=req.params.index
      res.render("library-item-edit",{itemData:itemData})
    }
  }catch{
    req.flash("errors", "Sorry!!There is some problem!!")
    req.session.save(function() {
      res.redirect("/library")
    })
  }
}

exports.updateItem =function (req, res) {
  console.log("Note :",req.body)
  let library=new Library(req.body,req.username)
    library.updateItem(req.params.index).then(()=>{
      req.flash("success", "Successfully updated note data.")
      req.session.save(function() {
        res.redirect(`/library/item/${req.params.index}/edit`)
      })
    }).catch((errors)=>{
      errors.forEach(function(error) {
        req.flash("errors", error)
      })
      req.session.save(function() {
        res.redirect(`/library/item/${req.params.index}/edit`)
      })
    })  
  
}
