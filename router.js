const express = require("express")
const router = express.Router()
const userController = require("./controllers/userController")
const batchController = require("./controllers/batchController")
const homeTuitionController = require("./controllers/homeTuitionController")
const userAccountController = require("./controllers/userAccountController")
const messageController = require("./controllers/messageController")
const postController = require("./controllers/postController")
const batchMessageController=require("./controllers/batchMessageController")

//guest user
router.get("/", userController.guestHome)
router.get("/sign-up-form", userController.signUp)

//user related router
router.post("/createAccount", userController.userRegister)
router.get("/user-home", userController.userMustBeLoggedIn, userController.getConnections, userController.userHome)
router.get("/notifications", userController.userMustBeLoggedIn, userController.getNotifications)
router.post("/userLogin", userController.userLogin)
router.get("/profile/:username", userController.userMustBeLoggedIn, userController.ifUserExists, userController.getUserProfileData)
router.post("/upgradeAccount", userController.userMustBeLoggedInAsStudent, userAccountController.ifUserStudent, userAccountController.upgradeAccount)

router.get('/profile/:username/edit', userController.userMustBeLoggedIn, userController.viewProfileEditScreen)
router.post('/profile/:username/edit', userController.userMustBeLoggedIn, userController.editProfile)

//profile routers
router.get("/teachers/:username", userController.userMustBeLoggedIn, userController.ifUserExists, userController.allTeachers)
router.get("/friends/:username", userController.userMustBeLoggedIn, userController.ifUserExists, userController.allFriends)
router.get("/students/:username", userController.userMustBeLoggedIn, userController.ifUserExists, userController.allStudents)

//message related routers
router.get("/messages", userController.userMustBeLoggedIn, messageController.getMessagesRoom)
router.get("/single-chat/:username", userController.userMustBeLoggedIn, messageController.getSingleRoom)
router.post("/sendMessage/:username", userController.userMustBeLoggedIn, messageController.sendMessage)

//search related router
router.post("/search", userController.userMustBeLoggedIn, userController.search)
router.get("/search-home-tuitor-page",userController.searchHomeTuitorPage)
router.get("/search-batch-page",userController.searchBatchPage)
router.post("/search-home-tuitor",userController.searchHomeTuitor)
router.post("/search-batch",userController.searchBatch)

//batch related router
router.get("/batches", userController.userMustBeLoggedIn, batchController.getAllBatches)
router.post("/createBatch", userController.userMustBeLoggedInAsTeacher, batchController.batchCreate)
router.post("/requestForAdmission/:_id", userController.userMustBeLoggedInAsStudent, batchController.ifBatchExists, batchController.sentRequest)
router.get("/viewSingleBatch/:_id", userController.userMustBeLoggedIn, batchController.ifBatchExists, batchController.getSingleBatch)
router.post("/acceptRequest/:_id/batch", userController.userMustBeLoggedInAsTeacher, batchController.ifBatchExists, batchController.acceptRequest)
router.post("/deleteRequest/:_id/batch", userController.userMustBeLoggedInAsTeacher, batchController.ifBatchExists, batchController.deleteRequest)
router.post("/deleteStudent/:_id/batch", userController.userMustBeLoggedInAsTeacher, batchController.ifBatchExists, batchController.deleteStudent)
router.get("/batchesTaken/:username", userController.userMustBeLoggedIn, userController.ifUserExists, userController.batchesTaken)
router.get("/batchesTeach/:username", userController.userMustBeLoggedIn, userController.ifUserExists, userController.batchesTeach)

//home-tuition router
router.post("/createHomeTuitionAnnouncement", userController.userMustBeLoggedInAsTeacher, homeTuitionController.createAnnouncement)
router.post("/stopAnnouncement/:_id/homeTuition", userController.userMustBeLoggedInAsTeacher, homeTuitionController.ifAnnouncementExists, homeTuitionController.stopAnnouncement)
router.post("/deleteAnnouncement/:_id/homeTuition", userController.userMustBeLoggedInAsTeacher, homeTuitionController.ifAnnouncementExists, homeTuitionController.deleteAnnouncement)
router.post("/restartAnnouncement/:_id/homeTuition", userController.userMustBeLoggedInAsTeacher, homeTuitionController.ifAnnouncementExists, homeTuitionController.restartAnnouncement)
router.get("/homeTuitionAnnouncement/:_id/details",userController.userMustBeLoggedIn,homeTuitionController.ifAnnouncementExists,homeTuitionController.getSingleAnnouncementDetails)

//file upload
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

//logging out
router.post("/logout", userController.logout)

module.exports = router
