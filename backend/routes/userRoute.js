const express = require("express")
const { registerUser, loginUser, logoutUser, forgotPassword, getUserDetails, resetPassword, updatePassword, updateProfile, getAllUsers, getSingleUser, updateRole, deleteUser } = require("../controllers/userController")
const { isAuthenticated, authorizedRoles } = require("../middleware/auth")

const router = express.Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)
router.route("/logout").get(logoutUser)
router.route("/me").get(isAuthenticated ,getUserDetails)
router.route("/password/update").put(isAuthenticated,updatePassword)
router.route("/me/update").put(isAuthenticated,updateProfile)
router.route("/admin/users").get(isAuthenticated,authorizedRoles("admin"),getAllUsers)
router.route("/admin/user/:id").get(isAuthenticated,authorizedRoles("admin"),getSingleUser).put(isAuthenticated,authorizedRoles("admin"),updateRole).delete(isAuthenticated,authorizedRoles("admin"),deleteUser)

module.exports = router