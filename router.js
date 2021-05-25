const express = require("express")
const router = express.Router()
const userController = require("./controllers/userController")
const batchController = require("./controllers/batchController")
const homeTuitionController = require("./controllers/homeTuitionController")
const userAccountController = require("./controllers/userAccountController")
const messageController = require("./controllers/messageController")
const postController = require("./controllers/postController")
const batchMessageController=require("./controllers/batchMessageController")
const passwordController=require("./controllers/passwordController")
const libraryController=require("./controllers/libraryController")
const ratingController=require("./controllers/ratingController")

//guest user
router.get("/", userController.guestHome)
router.get("/sign-up", userController.signUp)
router.get("/log-in", userController.logIn)

//user related router
router.post('/doesUsernameExist', userController.doesUsernameExist)
router.post("/createAccount", userController.userRegister)
router.post("/userLogin", userController.userLogin)

router.get("/user-home", userController.userMustBeLoggedIn, userController.getConnectionsForHome,userController.getActiveContacts, userController.userHome)
router.get("/notifications", userController.userMustBeLoggedIn,userController.getConnectionsForHome,userController.getActiveContacts, userController.getNotifications)
router.get("/messages", userController.userMustBeLoggedIn,userController.getConnectionsForHome,userController.getActiveContacts, messageController.getMessagesRoom)
router.get("/batches", userController.userMustBeLoggedIn,userController.getConnectionsForHome,userController.getActiveContacts, batchController.getAllBatches)
router.get('/library',userController.userMustBeLoggedIn,userController.getConnectionsForHome,userController.getActiveContacts,libraryController.getLibraryData)



//profile routers
router.get("/profile/:username", userController.userMustBeLoggedIn, userController.ifUserExists,userController.getConnectionsForProfile, userController.getUserProfileData)
router.post("/upgradeAccount", userController.userMustBeLoggedInAsStudent, userAccountController.ifUserStudent, userAccountController.upgradeAccount)
router.get('/profile/:username/edit', userController.userMustBeLoggedIn, userController.viewProfileEditScreen)
router.post('/profile/:username/edit', userController.userMustBeLoggedIn, userController.editProfile)
router.post('/present-address/:username/update', userController.userMustBeLoggedIn, userController.updatePresentAddress)
router.post("/changePassword", userController.userMustBeLoggedIn, passwordController.changePassword)
router.get("/teachers/:username", userController.userMustBeLoggedIn, userController.ifUserExists, userController.allTeachers)
router.get("/friends/:username", userController.userMustBeLoggedIn, userController.ifUserExists, userController.allFriends)
router.get("/students/:username", userController.userMustBeLoggedIn, userController.ifUserExists, userController.allStudents)
router.get("/running-batches/:username",userController.userMustBeLoggedIn,userController.ifUserExists,userController.runningBatches)
router.post("/update-bio-status/:username",userController.userMustBeLoggedIn,userController.ifUserExists,userController.updateBioStatus)

//message related routers
router.get("/single-chat/:username", userController.userMustBeLoggedIn, userController.getConnectionsForHome,userController.getActiveContacts, messageController.getSingleRoom)
router.post("/sendMessage/:username", userController.userMustBeLoggedIn, messageController.sendMessage)

//search related routers
router.post("/search", userController.userMustBeLoggedIn, userController.search)
router.get("/search-home-tuitor-page",userController.searchHomeTuitorPage)
router.get("/search-batch-page",userController.searchBatchPage)
router.post("/search-home-tuitor",userController.searchHomeTuitor)
router.post("/search-batch",userController.searchBatch)

//batch related router
router.get("/create-batch", userController.userMustBeLoggedInAsTeacher, batchController.getBatchCreationForm)
router.post("/createBatch", userController.userMustBeLoggedInAsTeacher, batchController.batchCreate)
router.post("/requestForAdmission/:_id", userController.userMustBeLoggedInAsStudent, batchController.ifBatchExists, batchController.sentRequest)
router.get("/viewSingleBatch/:_id", userController.userMustBeLoggedIn, batchController.ifBatchExists, batchController.getSingleBatch)
router.post("/acceptRequest/:_id/batch", userController.userMustBeLoggedInAsTeacher, batchController.ifBatchExists, batchController.acceptRequest)
router.post("/deleteRequest/:_id/batch", userController.userMustBeLoggedInAsTeacher, batchController.ifBatchExists, batchController.deleteRequest)
router.post("/deleteStudent/:_id/batch", userController.userMustBeLoggedInAsTeacher, batchController.ifBatchExists, batchController.deleteStudent)

//home-tuition router
router.get("/create-home-tuition-announcement", userController.userMustBeLoggedInAsTeacher, homeTuitionController.getHomeTuitionAnnouncementForm)
router.post("/createHomeTuitionAnnouncement", userController.userMustBeLoggedInAsTeacher, homeTuitionController.createAnnouncement)
router.post("/stopAnnouncement/:_id/homeTuition", userController.userMustBeLoggedInAsTeacher, homeTuitionController.ifAnnouncementExists, homeTuitionController.stopAnnouncement)
router.post("/deleteAnnouncement/:_id/homeTuition", userController.userMustBeLoggedInAsTeacher, homeTuitionController.ifAnnouncementExists, homeTuitionController.deleteAnnouncement)
router.post("/restartAnnouncement/:_id/homeTuition", userController.userMustBeLoggedInAsTeacher, homeTuitionController.ifAnnouncementExists, homeTuitionController.restartAnnouncement)
router.get("/homeTuitionAnnouncement/:_id/details",userController.userMustBeLoggedIn,homeTuitionController.ifAnnouncementExists,homeTuitionController.getSingleAnnouncementDetails)

//file upload
router.get("/photo-upload", userController.userMustBeLoggedIn, userController.getConnectionsForHome,userController.getActiveContacts, postController.getPhotoUploadForm)
router.post("/profilePictureUpload", userController.userMustBeLoggedIn, userController.uploadProfilePicture)
router.post("/coverPictureUpload", userController.userMustBeLoggedIn, userController.uploadCoverPicture)

//post related rought
router.post("/post-create", userController.userMustBeLoggedIn, postController.createPost)
router.post("/like/:postId", userController.userMustBeLoggedIn, postController.ifPostExists, postController.like)
router.post("/disLike/:postId", userController.userMustBeLoggedIn, postController.ifPostExists, postController.disLike)
router.post("/comment/:postId/post", userController.userMustBeLoggedIn, postController.ifPostExists, postController.commentOnPost)
router.post("/post/:postId/delete", userController.userMustBeLoggedIn, postController.ifPostExists, postController.deletePost)

//Batch-group-chat router
router.get('/group-chat/:_id',userController.userMustBeLoggedIn,batchController.ifBatchExists,batchMessageController.ifBatchStudent,batchMessageController.getMessages)
router.post('/group-chat/:_id',userController.userMustBeLoggedIn,batchController.ifBatchExists,batchMessageController.ifBatchStudent,batchMessageController.sentMessage)

//library related router
router.post('/add-library-item',userController.userMustBeLoggedIn,libraryController.addNote)
router.get('/library/item/:index/edit',userController.userMustBeLoggedIn,libraryController.getEditNotePage)
router.post('/library/item/:index/edit',userController.userMustBeLoggedIn,libraryController.updateItem)

//rating related router
router.post("/giveRating/:username",userController.userMustBeLoggedInAsStudent,userController.ifUserExists,ratingController.isStudentOfTheTeacher,ratingController.firstRating,ratingController.giveRating)

//logging out
router.post("/logout", userController.logout)

module.exports = router
