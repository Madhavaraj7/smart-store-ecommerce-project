const express = require('express');
const userRoute = express();

const bodyParser = require('body-parser');

// requiring auth
const auth = require("../middleware/auth");


const userController = require('../controllers/userController');
const user = require('../models/userModel');

// Middleware for parsing JSON and URL-encoded data
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));// Middleware for parsing JSON and URL-encoded data



userRoute.get('/', userController.userLandingPage);//Render the landing page

userRoute.get('/signup',  userController.userSignup); // Render the signup page
userRoute.post("/signup", userController.signedUp);

//otp
userRoute.get("/otpPage", userController.insertUser);

userRoute.post('/otp',userController.postVerifyOtp)
userRoute.get('/otp',userController.getVerifyOtp)
userRoute.post('/resendOTP', userController.insertUser);

userRoute.get("/home",userController.home)


userRoute.get("/login",  userController.loadLogin);
userRoute.post("/login", userController.verifyLogin);


userRoute.get("/forget",userController.forgetLoad)


userRoute.post("/forget",userController.forgetVerify);

userRoute.get("/forget-password",userController.forgetPasswordLoad)

userRoute.post("/forget-password",userController.resetPassword)


userRoute.get("/logout", userController.userLogout);













// Export the userRoute
module.exports= userRoute;
