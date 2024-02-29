const express = require('express');
const userRoute = express();
const bodyParser = require('body-parser');

// requiring auth
const blockedUserCheck = require('../middleware/blockUserCheck.js')
const accountController = require('../controllers/accountController.js')
const userController = require('../controllers/userController');
const cartController =  require("../controllers/cartController.js")
const shopPageController = require('../controllers/shopPageController.js')
const wishlistController = require('../controllers/wishlistController.js')

const user = require('../models/userModel');

// requiring auth
const auth = require("../middleware/userAuth.js");

// Middleware for parsing JSON and URL-encoded data
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));// Middleware for parsing JSON and URL-encoded data




// -------------------------------------------------------SIGNUP------------------------------------------------------------------------------

userRoute.get('/', userController.userLandingPage);
userRoute.get('/signup',  userController.userSignup);
userRoute.post("/signup", userController.signedUp);






// -------------------------------------------------------OTP------------------------------------------------------------------------------

userRoute.get("/otpPage", userController.insertUser);
userRoute.post('/otp',userController.postVerifyOtp)
userRoute.get('/otp',userController.getVerifyOtp)
userRoute.post('/resendOTP', userController.insertUser);





// -------------------------------------------------------LOGIN------------------------------------------------------------------------------

userRoute.get("/login", userController.loadLogin);
userRoute.post("/login",userController.verifyLogin);




// -------------------------------------------------------Forget password------------------------------------------------------------------------------


userRoute.get("/forget",userController.forgetLoad)
userRoute.post("/forget",userController.forgetVerify);
userRoute.get("/forget-password",userController.forgetPasswordLoad)
userRoute.post("/forget-password",userController.resetPassword)





// -------------------------------------------------------Home------------------------------------------------------------------------------

userRoute.get("/home",auth.isLogin,userController.home)

// -------------------------------------------------------Productslist------------------------------------------------------------------------------

userRoute.get('/productList', auth.isLogin,blockedUserCheck, shopPageController.shopPage)
userRoute.get('/productList/filter/category/:categoryName', auth.isLogin,blockedUserCheck, shopPageController.filterCategory)
userRoute.get('/productList/filter/priceRange', auth.isLogin,blockedUserCheck, shopPageController.filterPriceRange);
userRoute.get('/productList/sort/priceAscending',auth.isLogin, blockedUserCheck, shopPageController.sortPriceAscending)
userRoute.get('/productList/sort/priceDescending', auth.isLogin,blockedUserCheck, shopPageController.sortPriceDescending)
userRoute.post("/search-prouct", shopPageController.searchUserProductController);


//single product
userRoute.get('/productDetails/:id',auth.isLogin,userController.productDetils);




// -------------------------------------------------------cart------------------------------------------------------------------------------

userRoute.get('/cart',auth.isLogin, blockedUserCheck,cartController.cart) 
userRoute.get('/cart/:id',auth.isLogin, blockedUserCheck,cartController.addToCart) 
userRoute.delete('/cart/delete/:id', auth.isLogin,blockedUserCheck,cartController.deleteFromCart) 
userRoute.put('/cart/decQty/:id', auth.isLogin,blockedUserCheck,  cartController.decQty)
userRoute.put('/cart/incQty/:id', auth.isLogin,blockedUserCheck,  cartController.incQty)




// -------------------------------------------------------checkout page------------------------------------------------------------------------------

userRoute.get('/checkout', auth.isLogin,blockedUserCheck, cartController.checkoutPage)
userRoute.all('/checkout/orderPlaced', auth.isLogin,blockedUserCheck, cartController.orderPlaced);
userRoute.all('/checkout/orderPlacedEnd', auth.isLogin,blockedUserCheck,cartController.orderPlacedEnd)
// userRoute.post('/checkout/razorpay/create/orderId', blockedUserCheck, cartController.razorpayCreateOrderId)
userRoute.post('/checkout/razorpay/create/orderId', blockedUserCheck,cartController.razorpayCreateOrderId)


userRoute.post("/checkout/applyCoupon",blockedUserCheck, cartController.applyCoupon);
userRoute.post("/orders/storeDiscount",cartController.storedApplycoupon);





// -------------------------------------------------------Account Page------------------------------------------------------------------------------


userRoute.get('/account', auth.isLogin,blockedUserCheck,accountController.accountPage);

//account-my address
userRoute.get('/account/myAddress', auth.isLogin,blockedUserCheck, accountController.myAddress)
userRoute.get('/account/addAddress', auth.isLogin,blockedUserCheck,  accountController.addAddress)
userRoute.post('/account/addAddress', auth.isLogin,blockedUserCheck, accountController.addAddressPost)
userRoute.get('/account/editAddress/:id', auth.isLogin,blockedUserCheck,accountController.editAddress)
userRoute.post('/account/editAddress/:id', auth.isLogin,blockedUserCheck,  accountController.editAddressPost)
userRoute.get('/account/deleteAddress/:id', auth.isLogin,blockedUserCheck, accountController.deleteAddress)

//account-change password
userRoute.get('/account/changePassword', auth.isLogin,blockedUserCheck,accountController.changePassword)
userRoute.patch('/account/changePassword', auth.isLogin,blockedUserCheck, accountController.changePasswordPatch)

//account-orderlist
userRoute.get('/account/orderList', auth.isLogin,blockedUserCheck, accountController.orderList);
userRoute.get('/account/orderList/orderStatus/:id',auth.isLogin, blockedUserCheck, accountController.orderStatus)


userRoute.put('/account/orderList/orderStatus/cancelOrder/:id',auth.isLogin, blockedUserCheck,accountController.cancelOrder )
userRoute.put('/account/orderList/orderStatus/returnorder/:id', accountController.returnRequest)
userRoute.get('/account/orderList/orderStatus/downloadInvoice/:id', blockedUserCheck, accountController.downloadInvoice)

userRoute.post('/account/razorpay/create/orderId', blockedUserCheck, accountController.razorpayCreateWallet)
userRoute.post('/account/razoropay/end', blockedUserCheck, accountController.addRazorpayAmountToWallet);







// -------------------------------------------------------WISH LIST------------------------------------------------------------------------------

userRoute.get("/wishlist",wishlistController.getWishList)
userRoute.get('/wishlist/:id',auth.isLogin, blockedUserCheck,wishlistController.addToWishlistController) 
userRoute.delete('/wishlist/delete/:id', auth.isLogin,blockedUserCheck,wishlistController.removeFromWishList) 







// -------------------------------------------------------Logout------------------------------------------------------------------------------
userRoute.get("/logout", userController.userLogout);






















// Export the userRoute
module.exports= userRoute;
