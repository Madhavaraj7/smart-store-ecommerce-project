const userRoute = require("../routes/userRoutes");
const userdata = require("../models/userModel");

const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");

const productCollection = require("../models/productModel.js");
const categoryCollection = require("../models/categoryModel.js");

//////////////////to dispaly landing page

const userLandingPage = async (req, res) => {
  try {
    if (req.session.isLoggedin) {
      res.redirect("/home");
    } else {
      res.render("users/userLandingPage", { error: null });
    }
    console.log("hello");
  } catch (error) {
    console.log(error.message);
  }
};

//////////////////to dispaly signup page
const userSignup = async (req, res) => {
  try {
    req.session.emailExcisting;
    res.render("users/userSignup", {
      error: null,
      emailExcisting: req.session.emailExcisting,
    });
    req.session.emailExcisting = false;
    req.session.save();
  } catch (error) {
    console.log(error.message);
  }
};

//render into otp function
const insertUser = async (req, res) => {
  // console.log("hello");
  console.log(req.session.userData);
  const email = req.session.userData.email;
  let otp = await userSendOtp(email);
  req.session.otp = otp;

  res.render("users/otpPage", { otp });
};

//existing email
const signedUp = async (req, res) => {
  try {
    const emailExcisting = await userdata.findOne({ email: req.body.email });

    console.log(`emailExcisting \n${emailExcisting}`);
    if (!emailExcisting) {
      const pass = await bcrypt.hash(req.body.password, 10);
      console.log(pass);
      console.log(req.body);
      const userData = {
        name: req.body.name,
        phonenumber: req.body.phonenumber,
        email: req.body.email,
        password: pass,
      };

      req.session.userData = userData;

      res.redirect("/otpPage");
    } else {
      req.session.emailExcisting = true;
      res.redirect("/signup");
    }
  } catch (err) {
    console.log(`Erro from signUP router ${err}`);
  }
};

// console.log("hello")
//   try {
//     const spassword = await bcrypt.hash(req.body.password, 10);
//     await new userModel({
//       name: req.body.name, // using body-parser middleware
//       email: req.body.email,
//       phonenumber: req.body.mobile,
//       password: spassword,
//       is_admin: 0,
//     }).save()

//     //returning a promise
//     // const userData = await user.save(); //saving data to mongo db

//     if (userData) {
//       res.render("otpPage", {
//         message: "Your registration has Sucessfully Please login!",
//       });
//     } else {
//       res.render("usersignup", { message: "Your registration has failed." });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

////////////////////to send otp for the verification to user email
const userSendOtp = async (email) => {
  try {
    console.log("in send otp function");

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "storesmart863@gmail.com",
        pass: "shpv unkn wdpx lpsy",
      },
    });

    // Generate a random OTP (6-digit number)
    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
      from: "storesmart863@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    };
    // req.session.otp = otp;
    console.log(otp);
    //Send the email
    let mail = await transporter.sendMail(mailOptions);
    return otp;

    // emailOtp = req.session.otp;
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    console.log(req.url);
    // req.session.user = { name: user.name, id: user._id }
    res.render("users/login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await userdata.findOne({ email: email, isBlocked: false });
    // const user = await userdata.findOne({ email: email });

    if (!userData) {
      req.session.userNotFound = true;
      res.render("users/login", {
        message: "user is blocked",
      });
    }
    if (userData.isBlocked) {
      req.session.userNotFound = true;
      res.render("users/login", {
        message: "user is Not Found",
      });
    }

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      //authentication of user
      if (passwordMatch) {
        req.session.user_id = userData._id;
        req.session.isLoggedin = true;

        req.session.userIsThere = {
          isAlive: true,
          userName: userData.name,
        };
        req.session.save();
        res.redirect("/home");
      } else {
        res.render("users/login", {
          message: "Email and password is incorrect",
        });
      }
    } else {
      res.render("users/login", { message: "Email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//forget password

const forgetLoad = async (req, res) => {
  try {
    res.render("users/forget");
  } catch (error) {
    console.log(error.message);
  }
};

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await userdata.findOne({ email: email });

    if (userData) {
      if (userData.is_verified === 0) {
        res.render("users/forget", { message: "please verify your email" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await userdata.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        // console.log(req.body.token)
        console.log(randomString);
        sendResetPasswordMail(userData.name, userData.email, randomString);
        res.render("users/forget", {
          message: "please check your mail to reset your password",
        });
      }
    } else {
      res.render("users/forget", { message: "email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//for reset password send email

const sendResetPasswordMail = async (name, email, token) => {
  try {
    // console.log("in send otp function");
    //  console.log(req.body.token);

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "storesmart863@gmail.com",
        pass: "shpv unkn wdpx lpsy",
      },
    });
    console.log(token);
    const mailOptions = {
      from: "storesmart863@gmail.com",
      to: email,
      subject: "for Reset password",
      // html:'<p>Hiii '+name+',please click here to < a href="http://localhost:3001/forget-password?token='+token+'"> Reset</a> your password.</p>',
      html:
        "<p>Hello " +
        name +
        ',</p><p>please click here to <a href="http://localhost:3001/forget-password?token=' +
        token +
        '">reset </a> your password.</p>',
    };
    // req.session.otp = otp;
    // console.log(otp);
    //Send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent:-", info.response);
      }
    });

    // emailOtp = req.session.otp;
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    console.log(req.body.token);
    const tokenData = await userdata.findOne({ token: token });
    if (tokenData) {
      res.render("users/forget-password", { user_id: tokenData._id });
    } else {
      res.render("users/404", { message: "token is invalid" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const secure_password = await securePassword(password);

    const updateddata = await userdata.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password, token: "" } }
    );
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

//logout function
const userLogout = async (req, res) => {
  try {
    // req.session.destroy();
    req.session.userId = false;
    req.session.isLoggedin = null;
    req.session.userIsThere = false;
    req.session.save();
    console.log("logged out");
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const productspage = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = 4;
    let skip = (page - 1) * limit;

    let categoryData = await categoryCollection.find({ isListed: true });
    let productData = await productCollection
      .find({ isListed: true })
      .skip(skip)
      .limit(limit)


    let count = await productCollection.countDocuments({ isListed: true });

    let totalPages = Math.ceil(count / limit);
    let totalPagesArray = new Array(totalPages).fill(null);

    res.render("users/productlist", {
      categoryData,
      productData,
      currentUser: req.session.currentUser,
      user: req.session.user,
      count,
      limit,
      totalPagesArray,
      currentPage: page,
      selectedFilter: req.session.selectedFilter,
    });

    console.log(req.session.currentUser);
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).send("Internal Server Error");
  }
};



const productDetils = async (req, res) => {
  try {
    const currentProduct = await productCollection.findOne({
      _id: req.params.id,
    });
    console.log(currentProduct);
    res.render("users/productDetils.ejs", {
      user: req.session.user,
      currentProduct,
    });
  } catch (error) { }
};




module.exports = {
  userLandingPage,
  userSignup,
  insertUser,
  signedUp,
  userSendOtp,
  loadLogin,
  verifyLogin,
  forgetLoad,
  forgetVerify,
  sendResetPasswordMail,
  forgetPasswordLoad,
  resetPassword,
  securePassword,
  userLogout,
  productspage,
  productDetils,
  // getUserLoginController,
  // userLoginController,










  //    OTP   //

  getVerifyOtp: (req, res) => {
    res.render("otp");
  },

  postVerifyOtp: async (req, res) => {
    console.log(req.session.userData);

    const { name, email, phonenumber, password } = req.session.userData;
    const otp = req.body.OTP;

    console.log(otp);
    console.log(req.session.otp);
    if (otp == req.session.otp) {
      console.log("otp verified");

      const user = new userdata({ name, email, phonenumber, password });
      console.log(user);
      req.session.userIsThere = {
        isAlive: true,
        userName: name,
      };
      // req.session.save();
      await user.save();
      res.redirect("/home");
    } else {
      res.render("users/otpPage", { message: "Invalid otp" });
    }
  },

  home: async (req, res) => {
    try {
      req.session.userIsThere;
      if (req.session.isLoggedin) {
        res.render("users/home", { isAlive: req.session.userIsThere });
      } else {
        res.redirect("/");
      }

      console.log(req.url);

      console.log("heyyy");
    } catch (error) {
      console.log(error.message);
    }
  },
};
