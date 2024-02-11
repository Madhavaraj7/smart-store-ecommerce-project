//to check weather user is logged in or not
const isAdmin = async(req,res,next)=>{
  try {
    if (req.session.user_id) {

    } else {
      res.redirect('/admin');
    }
    next();

  } catch (error) {
    console.log(error.message);
  }
}

module.exports = { isAdmin };