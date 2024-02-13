const wishListCollection = require("../models/wishListModel.js");

const cartCollection = require("../models/cartModel.js");




const getWishList = async (req, res) => {
    try {
        const products = await wishListCollection
      .find({ userId: req.session.currentUser._id})
      .populate("productId");
    
        res.render("users/wishList", {
          signIn: req.session.signIn,
          user: req.body.user,
          products,
         
          
        });
        console.log(req.session.currentUser);
      } catch (error) {
        console.error("Error in cart:", error);
        // res.status(500).send("Internal Server Error");
        // res.redirect('/loginpage')
      }
};



const addToWishlistController = async (req, res) => {
    try {
        let existingProduct = await wishListCollection.findOne({
          userId: req.session.currentUser._id,
          productId: req.params.id,
        });
    
        if (existingProduct) {
          await wishListCollection.updateOne(
            { _id: existingProduct._id },
            { $inc: { productQuantity: 1 } }

          );
        } else {
          await wishListCollection.create({
            userId: req.session.currentUser._id,
            productId: req.params.id,
            currentUser: req.session.currentUser,
            user: req.body.user,
          });
        }
    
        console.log(req.body);
        res.redirect("/wishList");
        // res.status(200).json({ success: true });
      } catch (error) {
        console.log(error);
    
        // res.redirect('/loginpage')
    
        // console.error("Error in addToCart:", error);
        // res.status(500).send("Internal Server Error");
      }
};

// const removeFromWishList = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const wishlist = await wishListModel.deleteOne({
//       user: req.session.user._id,
//       product: id,
//     });
//     res.status(200).send({ success: true });
//   } catch (error) {
//     console.log(error);
//   }
// };

const removeFromWishList = async (req, res) => {
    try {
      await wishListCollection.findOneAndDelete({ _id: req.params.id });
      res.send("hello ur cart is deleted");
    } catch (error) {
      console.error(error);
    }
  };

module.exports = { getWishList,addToWishlistController,removeFromWishList };