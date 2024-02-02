const userRoute = require("../routes/userRoutes");
const userdata = require("../models/userModel");


//requiring bcrypt
const bcrypt = require("bcrypt");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//admin login page
const loadLogin = async(req,res)=>{
    try {
      res.render('admin/login');
    
    } catch (error) {
      console.log(error.message)
    }
    }

    const verifyLogin = async (req,res)=>{
      try {
        const email = req.body.email;
        const password = req.body.password;
    
        const userData = await userdata.findOne({email:email})
      
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
    
              if(passwordMatch){
                req.session.user_id = userData._id;
                req.session.isLoggedin = true
              
                if(userData.is_admin===0){
                  
                  res.render('admin/login',{message:"Email and password incorrect"})
                }
                else{
                  req.session.user_id = userData._id;
                  res.redirect("admin/adminHome")
    
                }
              }
              else{
                res.render('admin/login',{message:"Email and password incorrect"})
              }
          }
        else{
          res.render('admin/login',{message:"Email and password incorrect"})
        }
    
      } catch (error) {
        console.log(error.message);
      }
    }

    const adminHome = async (req, res) => {
      try {
    
        const userData = await userdata.findById({_id:req.session.user_id});
        res.render('admin/dashboard',{admin:userData});
    
      } catch (error) {
        console.log(error.message);
      }
    };

    //logout function
const adminLogout = async (req, res) => {
  try {
    // req.session.destroy();
    req.session.userId = false
    req.session.isLoggedin = false
    console.log("logged out"); 
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

    module.exports = {
        loadLogin, 
        verifyLogin,
        adminHome,
        adminLogout,
      }