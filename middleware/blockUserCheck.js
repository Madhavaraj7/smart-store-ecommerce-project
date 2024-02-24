const userCollection = require("../models/userModel.js");
/**
 * 
 *  
 *  
 */
blockuser = async (req, res, next) => {
  try {
    let currentUser = await userCollection.findOne({
      _id: req.session?.currentUser?._id,
    });
    if ( currentUser?.isBlocked) {
      req.session.destroy();
      res.redirect(req.originalUrl)
    } else {
      next();
    }
  } catch (error) {
    console.error(error)
  }
}
  module.exports = blockuser;