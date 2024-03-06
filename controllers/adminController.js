const userRoute = require("../routes/userRoutes");
const userdata = require("../models/userModel");
const productCollection = require("../models/productModel.js");
const dashboard = require("../service/dashboardChart.js");

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
    console.log(req.body);

    const userData = await userdata.findOne({ email });
    console.log(userData);

    if (userData) {
      if (password === userData.password) {
        req.session.user_id = userData._id;
        req.session.isLoggedin = true;

        if (userData.is_admin === 0) {
          res.render("admin/login", {
            message: "Email and password incorrect",
          });
        } else {
          req.session.isAdmin = true;
          res.redirect("/admin/adminHome");
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
    let productData =
      req.session?.shopProductData ||
      (await productCollection.find({ isListed: true }));

    if (!productData) {
      productData = [];
    }

    res.render("admin/dashboard", { productData, userData });
  } catch (error) {
    console.log(error.message);
  }
};

//logout function
const adminLogout = async (req, res) => {
  try {
    req.session.isAdmin = false;
    req.session.admin = null;
    req.session.user_id = null;
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
  } catch (error) {
    console.log(error);
  }
};

const dashboardData = async (req, res) => {
  try {
    const [
      productsCount,
      categoryCount,
      pendingOrdersCount,
      completedOrdersCount,
      currentDayRevenue,
      MonthlyRevenue,
      categoryWiseRevenue,
      shipping,
    ] = await Promise.all([
      dashboard.productsCount(),
      dashboard.categoryCount(),
      dashboard.pendingOrdersCount(),
      dashboard.completedOrdersCount(),
      dashboard.currentDayRevenue(),
      dashboard.MonthlyRevenue(),
      dashboard.categoryWiseRevenue(),
      dashboard.shipping(),
    ]);

    const data = {
      productsCount,
      categoryCount,
      pendingOrdersCount,
      completedOrdersCount,
      currentDayRevenue,
      MonthlyRevenue,
      categoryWiseRevenue,
      shipping,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
  }
};

const filterCategory = async (req, res) => {
  try {
    req.session.shopProductData = await productCollection
      .find({
        isListed: true,
        categoryName: req.body.categoriesName,
      })
      .populate("parentCategory");
    res.redirect("/admin/adminHome");
  } catch (error) {
    console.error(error);
  }
};
const filterPriceRange = async (req, res) => {
  try {
    req.session.shopProductData = await productCollection.find({
      isListed: true,
      stockSold: {
        $gt: 0 + 500 * req.query.priceRange,
        $lte: 500 + 500 * req.query.priceRange,
      },
    });
    res.redirect("/admin/adminHome");
  } catch (error) {
    console.error(error);
  }
};
const sortPriceAscending = async (req, res) => {
  try {
    req.session.shopProductData = await productCollection
      .find({ isListed: true })
      .sort({ stockSold: 1 });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
  }
};
const sortPriceDescending = async (req, res) => {
  try {
    req.session.shopProductData = await productCollection
      .find({ isListed: true })
      .sort({ stockSold: -1 });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
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
  dashboardData,
  filterCategory,
  filterPriceRange,
  sortPriceAscending,
  sortPriceDescending,
  // userManagement,
  // blockUser,
  // unBlockUser,
};
