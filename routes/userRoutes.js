const express = require('express');
const userRoute = express();

const bodyParser = require('body-parser');

// requiring auth
const blockedUserCheck = require('../middleware/blockUserCheck.js')
const accountController = require('../controllers/accountController.js')
const userController = require('../controllers/userController');
const cartController =  require("../controllers/cartController.js")

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


//home
userRoute.get("/home",userController.home)

//login
userRoute.get("/login", userController.loadLogin);
userRoute.post("/login",userController.verifyLogin);

//forget password
userRoute.get("/forget",userController.forgetLoad)
userRoute.post("/forget",userController.forgetVerify);
userRoute.get("/forget-password",userController.forgetPasswordLoad)
userRoute.post("/forget-password",userController.resetPassword)

//logout
userRoute.get("/logout", userController.userLogout);

//product list
userRoute.get('/productList', userController.productspage);
userRoute.get('/productDetails/:id',userController.productDetils);


//cart
userRoute.get('/cart', blockedUserCheck,cartController.cart) 
userRoute.get('/cart/:id', blockedUserCheck,cartController.addToCart) 
userRoute.delete('/cart/delete/:id', blockedUserCheck,cartController.deleteFromCart) 
userRoute.put('/cart/decQty/:id', blockedUserCheck,  cartController.decQty)
userRoute.put('/cart/incQty/:id', blockedUserCheck,  cartController.incQty)










//Account page

userRoute.get('/account', blockedUserCheck,accountController.accountPage);

//account-my address
userRoute.get('/account/myAddress', blockedUserCheck, accountController.myAddress)

userRoute.get('/account/addAddress', blockedUserCheck,  accountController.addAddress)
userRoute.post('/account/addAddress', blockedUserCheck, accountController.addAddressPost)

userRoute.get('/account/editAddress/:id', blockedUserCheck,accountController.editAddress)
userRoute.post('/account/editAddress/:id', blockedUserCheck,  accountController.editAddressPost)

userRoute.get('/account/deleteAddress/:id', blockedUserCheck, accountController.deleteAddress)

//account-change password

userRoute.get('/account/changePassword', blockedUserCheck,accountController.changePassword)

userRoute.patch('/account/changePassword', blockedUserCheck, accountController.changePasswordPatch)





userRoute.get('/checkout', blockedUserCheck, cartController.checkoutPage)
userRoute.all('/checkout/orderPlaced', blockedUserCheck, cartController.orderPlaced);
userRoute.all('/checkout/orderPlacedEnd', blockedUserCheck,cartController.orderPlacedEnd)





















// Export the userRoute
module.exports= userRoute;
