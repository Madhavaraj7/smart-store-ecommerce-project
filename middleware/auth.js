//to check weather user is logged in or not
const isLogin = async (req, res, next) => {
  try {
    if (req.session.isLoggedin) {
      next();
     
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      return res.redirect("/home");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
