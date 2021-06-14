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
const notificationController=require("./controllers/notificationController")
const feedbackController=require("./controllers/feedbackController")

//guest user
router.get("/",messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, userController.guestHome)
router.get("/sign-up", userController.signUp)
router.get("/log-in", userController.logIn)

//feedback related router
router.get("/feedback", userController.userMustBeLoggedIn, userController.getConnectionsForHome,userController.getActiveContacts,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber,feedbackController.getFeedbackForm)
router.post("/getFeedback", userController.userMustBeLoggedIn,feedbackController.getFeedback)

//user related router
router.post('/doesUsernameExist', userController.doesUsernameExist)
router.post("/createAccount", userController.userRegister)
router.post("/userLogin", userController.userLogin)

router.get("/user-home", userController.userMustBeLoggedIn, userController.getConnectionsForHome,userController.getActiveContacts,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, userController.userHome)
router.get("/notifications", userController.userMustBeLoggedIn,userController.getConnectionsForHome,userController.getActiveContacts,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, notificationController.getNotifications)
router.get("/messages", userController.userMustBeLoggedIn,userController.getConnectionsForHome,userController.getActiveContacts,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, messageController.getMessagesRoom)
router.get("/batches", userController.userMustBeLoggedIn,userController.getConnectionsForHome,userController.getActiveContacts,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, batchController.getAllBatches)
router.get('/library',userController.userMustBeLoggedIn,userController.getConnectionsForHome,userController.getActiveContacts,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber,libraryController.getLibraryData)



//profile routers
router.get("/profile/:username", userController.userMustBeLoggedIn, userController.ifUserExists,userController.getConnectionsForProfile,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, userController.getUserProfileData)
router.get("/upgradeAccount-form", userController.userMustBeLoggedInAsStudent,userAccountController.ifUserStudent,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber,userAccountController.getUpgradeAccountForm)
router.post("/upgradeAccount", userController.userMustBeLoggedInAsStudent, userAccountController.ifUserStudent, userAccountController.upgradeAccount)
router.get('/profile/:username/edit', userController.userMustBeLoggedIn,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, userController.viewProfileEditScreen)
router.post('/profile/:username/edit', userController.userMustBeLoggedIn, userController.editProfile)
router.post('/present-address/:username/update', userController.userMustBeLoggedIn, userController.updatePresentAddress)
router.post('/teacherData/:username/update', userController.userMustBeLoggedInAsTeacher, userController.updateTeacherData)

router.post("/changePassword", userController.userMustBeLoggedIn, passwordController.changePassword)
router.get("/teachers/:username", userController.userMustBeLoggedIn, userController.ifUserExists,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, userController.allTeachers)
router.get("/friends/:username", userController.userMustBeLoggedIn, userController.ifUserExists,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, userController.allFriends)
router.get("/students/:username", userController.userMustBeLoggedIn, userController.ifUserExists,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, userController.allStudents)
router.get("/running-batches/:username",userController.userMustBeLoggedIn,userController.ifUserExists,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber,userController.runningBatches)
router.post("/update-bio-status/:username",userController.userMustBeLoggedIn,userController.ifUserExists,userController.updateBioStatus)

//message related routers
router.get("/single-chat/:username", userController.userMustBeLoggedIn,userController.ifUserExists, userController.getConnectionsForHome,userController.getActiveContacts,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, messageController.getSingleRoom)
router.post("/sendMessage/:username", userController.userMustBeLoggedIn,userController.ifUserExists, messageController.sendMessage)

//Address related router
// router.post("/policeStations",  userController.policeStations)
// router.post("/postOffices",  userController.postOffices)

//search related routers
router.post("/search",  userController.search)
router.get("/search-home-tuitor-form",messageController.unseenMessageNumber,notificationController.unseenNotificationNumber,userController.searchHomeTuitorPage)
router.get("/search-batch-form",messageController.unseenMessageNumber,notificationController.unseenNotificationNumber,userController.searchBatchPage)
router.post("/home-tuitor-search-results",userController.searchHomeTuitor)
router.post("/batch-search-results",userController.searchBatch)

//batch related router
router.get("/create-batch", userController.userMustBeLoggedInAsTeacher,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, batchController.getBatchCreationForm)
router.post("/createBatch", userController.userMustBeLoggedInAsTeacher, batchController.batchCreate)
router.post("/requestForAdmission/:_id", userController.userMustBeLoggedInAsStudent, batchController.ifBatchExists, batchController.sentRequest)
router.get("/viewSingleBatch/:_id", userController.userMustBeLoggedIn, batchController.ifBatchExists,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, batchController.getSingleBatch)
router.get("/batch/:_id/edit", userController.userMustBeLoggedInAsTeacher, batchController.ifBatchExists,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, batchController.getBatchEditForm)
router.post("/batch/:_id/edit", userController.userMustBeLoggedInAsTeacher,batchController.ifBatchExists, batchController.editBatch)
router.post("/onlineBatch/:_id/update", userController.userMustBeLoggedInAsTeacher,batchController.ifBatchExists, batchController.updateOnlineDetails)

router.post("/acceptRequest/:_id/batch", userController.userMustBeLoggedInAsTeacher, batchController.ifBatchExists, batchController.acceptRequest)
router.post("/deleteRequest/:_id/batch", userController.userMustBeLoggedInAsTeacher, batchController.ifBatchExists, batchController.deleteRequest)
router.post("/deleteStudent/:_id/batch", userController.userMustBeLoggedInAsTeacher, batchController.ifBatchExists, batchController.deleteStudent)

//home-tuition router
router.get("/create-home-tuition-announcement", userController.userMustBeLoggedInAsTeacher,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, homeTuitionController.getHomeTuitionAnnouncementForm)
router.post("/createHomeTuitionAnnouncement", userController.userMustBeLoggedInAsTeacher, homeTuitionController.createAnnouncement)
router.post("/delete/announcement/:_id/homeTuition", userController.userMustBeLoggedInAsTeacher, homeTuitionController.ifAnnouncementExists, homeTuitionController.deleteAnnouncement)
router.get("/homeTuitionAnnouncement/:_id/details",userController.userMustBeLoggedIn,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber,homeTuitionController.ifAnnouncementExists,homeTuitionController.getSingleAnnouncementDetails)
// router.post("/stopAnnouncement/:_id/homeTuition", userController.userMustBeLoggedInAsTeacher, homeTuitionController.ifAnnouncementExists, homeTuitionController.stopAnnouncement)
// router.post("/restartAnnouncement/:_id/homeTuition", userController.userMustBeLoggedInAsTeacher, homeTuitionController.ifAnnouncementExists, homeTuitionController.restartAnnouncement)

//need home tuitor
router.get('/need-home-tuitor', userController.userMustBeLoggedInAsStudent,userController.getConnectionsForHome,userController.getActiveContacts,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, homeTuitionController.needHomeTuitor)
router.post("/needHomeTuitor", userController.userMustBeLoggedInAsStudent, homeTuitionController.needHomeTuitorAnnouncement)
router.get("/homeTuitorNeedAnnouncement/:_id/details",userController.userMustBeLoggedIn,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber,homeTuitionController.ifNeedTeacherAnnouncementExists,homeTuitionController.getSingleNeedTuitorAnnouncementDetails)
router.post("/delete/announcement/:_id/needTuitor", userController.userMustBeLoggedInAsTeacher, homeTuitionController.ifNeedTeacherAnnouncementExists, homeTuitionController.deleteNeedTuitorAnnouncement)

//file upload
router.get("/photo-upload", userController.userMustBeLoggedIn, userController.getConnectionsForHome,userController.getActiveContacts,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber, postController.getPhotoUploadForm)
router.post("/profilePictureUpload", userController.userMustBeLoggedIn, userController.uploadProfilePicture)
router.post("/coverPictureUpload", userController.userMustBeLoggedIn, userController.uploadCoverPicture)

//post related rought
router.post("/post-create", userController.userMustBeLoggedIn, postController.createPost)
router.post("/like/:postId", userController.userMustBeLoggedIn, postController.ifPostExists, postController.like)
router.post("/disLike/:postId", userController.userMustBeLoggedIn, postController.ifPostExists, postController.disLike)
router.post("/comment/:postId/post", userController.userMustBeLoggedIn, postController.ifPostExists, postController.commentOnPost)
router.post("/post/:postId/delete", userController.userMustBeLoggedIn, postController.ifPostExists, postController.deletePost)

//Batch-group-chat router
router.get('/group-chat/:_id',userController.userMustBeLoggedIn,batchController.ifBatchExists,batchMessageController.ifBatchStudent,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber,batchMessageController.getMessages)
router.post('/group-chat/:_id',userController.userMustBeLoggedIn,batchController.ifBatchExists,batchMessageController.ifBatchStudent,batchMessageController.sentMessage)

//library related router
router.post('/add-library-item',userController.userMustBeLoggedIn,libraryController.addNote)
router.get('/library/item/:index/edit',userController.userMustBeLoggedIn,messageController.unseenMessageNumber,notificationController.unseenNotificationNumber,libraryController.getEditNotePage)
router.post('/library/item/:index/edit',userController.userMustBeLoggedIn,libraryController.updateItem)

//rating related router
router.post("/giveRating/:username",userController.userMustBeLoggedInAsStudent,userController.ifUserExists,ratingController.isStudentOfTheTeacher,ratingController.firstRating,ratingController.giveRating)

//logging out
router.post("/logout", userController.logout)

module.exports = router
