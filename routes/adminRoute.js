//requiring express
const express = require("express")
const adminRoute = express();


const adminController = require("../controllers/adminController"); //requiring userController module

adminRoute.get('/',adminController.loadLogin);

adminRoute.post('/',adminController.verifyLogin);

adminRoute.get('/adminHome', adminController.adminHome)

adminRoute.get("/logout", adminController.adminLogout);






module.exports = adminRoute;   
