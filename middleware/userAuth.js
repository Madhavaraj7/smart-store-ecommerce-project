//to check weather user is logged in or not
const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      next();
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
};
