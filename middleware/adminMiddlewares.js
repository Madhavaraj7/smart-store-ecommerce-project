//to check weather user is logged in or not
const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect("/admin");
  }
};

module.exports = { isAdmin };