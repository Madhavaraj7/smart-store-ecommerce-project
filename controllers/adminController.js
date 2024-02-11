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
const loadLogin = async (req, res) => {
  try {
    if (req.session.isAdmin) {
      res.render("admin/dashboard");
    } else {
      res.render("admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await userdata.findOne({ email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        req.session.user_id = userData._id;
        req.session.isLoggedin = true;

        if (userData.is_admin === 0) {
          res.render("admin/login", {
            message: "Email and password incorrect",
          });
        } else {
          req.session.isAdmin = true;
          res.render("admin/dashboard");
        }
      } else {
        res.render("admin/login", { message: "Email and password incorrect" });
      }
    } else {
      res.render("admin/login", { message: "Email and password incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminHome = async (req, res) => {
  try {
    const userData = await userdata.findById({ _id: req.session.user_id });
    res.render("admin/dashboard", { admin: userData });
  } catch (error) {
    console.log(error.message);
  }
};

//logout function
const adminLogout = async (req, res) => {
  try {
    // req.session.destroy();
    // req.session.userId = false
    // req.session.isLoggedin = false
    req.session.isAdmin = false;
    req.session.admin = null;
    req.session.user_id=null;
    console.log("logged out");
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const userListController = async (req, res) => {
  try {
    if (req.session.isAdmin) {
      let users;
      let count;
      let page = Number(req.query.page) || 1;
      let limit = 5;
      let skip = (page - 1) * limit;
      if (!req.session.allUser) {
        count = await userdata.find().estimatedDocumentCount();
        users = await userdata.find().skip(skip).limit(limit);
      } else {
        users = req.session.allUser;
      }
      res.render("admin/userMangement", { users, count, limit });
      req.session.allUser = null;
      req.session.save();
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
  }
};
const blockUserController = async (req, res) => {
  console.log("hello");
  try {
    const { id } = req.params;
    const user = await userdata.findByIdAndUpdate(id, { isBlocked: true });

    res.redirect("/admin/userManagement");
  } catch (error) {
    console.log(error);
  }
};
const unblockUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userdata.findByIdAndUpdate(id, { isBlocked: false });
    res.redirect("/admin/userManagement");
    console.log("heyy");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  adminHome,
  adminLogout,
  userListController,
  blockUserController,
  unblockUserController,
  // userManagement,
  // blockUser,
  // unBlockUser,
};
