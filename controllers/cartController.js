const cartCollection = require("../models/cartModel.js");
const userCollection = require("../models/userModel.js");
const productCollection = require("../models/productModel.js");
const profileCollection = require("../models/addressModel.js");

const productModel = require("../models/productModel.js");
const CartModel = require("../models/cartModel.js");
const orderCollection = require("../models/orderModel.js");

async function grandTotal(req) {
  try {
    console.log("session" + req.session.currentUser);
    let userCartData = await cartCollection
      .find({ userId: req.session.currentUser._id })
      .populate("productId");
    console.log(Array.isArray(userCartData));
    let grandTotal = 0;
    for (const v of userCartData) {
      grandTotal += v.productId.productPrice * v.productQuantity;
      await cartCollection.updateOne(
        { _id: v._id },
        {
          $set: {
            totalCostPerProduct: v.productId.productPrice * v.productQuantity,
          },
        }
      );
    }
    userCartData = await cartCollection
      .find({ userId: req.session.currentUser._id })
      .populate("productId");
    req.session.grandTotal = grandTotal;

    return JSON.parse(JSON.stringify(userCartData));
  } catch (error) {
    console.log(error);
  }
}
const cart = async (req, res) => {
  try {
    let userCartData = await grandTotal(req);
    // console.log(userCartData);
    // console.log(req.session.currentUser);
    // console.log(req.session.user);

    res.render("users/cart", {
      signIn: req.session.signIn,
      user: req.body.user,
      // addressData: req.session.addressData,
      // addressData,
      currentUser: req.session.currentUser,
      userCartData,
      grandTotal: req.session.grandTotal,
    });
    console.log(req.session.currentUser);
  } catch (error) {
    console.error("Error in cart:", error);
    // res.status(500).send("Internal Server Error");
    // res.redirect('/loginpage')
  }
};

const addToCart = async (req, res) => {
  console.log(req.session.currentUser);
  try {
    let existingProduct = await cartCollection.findOne({
      userId: req.session.currentUser._id,
      productId: req.params.id,
    });

    if (existingProduct) {
      await cartCollection.updateOne(
        { _id: existingProduct._id },
        { $inc: { productQuantity: 1 } }
      );
    } else {
      await cartCollection.create({
        userId: req.session.currentUser._id,
        productId: req.params.id,
        productQuantity: req.body.productQuantity,
        currentUser: req.session.currentUser,
        user: req.body.user,
      });
    }

    console.log(req.body);
    res.redirect("/cart");
    // res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);

    // res.redirect('/loginpage')

    // console.error("Error in addToCart:", error);
    // res.status(500).send("Internal Server Error");
  }
};

const deleteFromCart = async (req, res) => {
  try {
    await cartCollection.findOneAndDelete({ _id: req.params.id });
    res.send("hello ur cart is deleted");
  } catch (error) {
    console.error(error);
  }
};
const decQty = async (req, res) => {
  try {
    let cartProduct = await cartCollection
      .findOne({ _id: req.params.id })
      .populate("productId");
    if (cartProduct.productQuantity > 1) {
      cartProduct.productQuantity--;
    }
    cartProduct = await cartProduct.save();
    await grandTotal(req);
    res.json({
      success: true,
      cartProduct,
      grandTotal: req.session.grandTotal,
      currentUser: req.session.currentUser,
      user: req.body.user,
    });
  } catch (error) {
    console.error(error);
  }
};
const incQty = async (req, res) => {
  try {
    let cartProduct = await cartCollection
      .findOne({ _id: req.params.id })
      .populate("productId");
    if (cartProduct.productQuantity < cartProduct.productId.productStock) {
      cartProduct.productQuantity++;
    }
    cartProduct = await cartProduct.save();
    await grandTotal(req);
    res.json({
      success: true,
      cartProduct,
      grandTotal: req.session.grandTotal,
      currentUser: req.session.currentUser,
      user: req.body.user,
    });
  } catch (error) {
    console.error(error);
  }
};

const checkoutPage = async (req, res) => {
  try {
    let cartData = await cartCollection
      .find({ userId: req.session.currentUser._id, productId: req.params.id })
      .populate("productId");
    let addressData = await profileCollection.find({
      userId: req.session.currentUser._id,
    });
    req.session.currentOrder = await orderCollection.create({
      userId: req.session.currentUser._id,
      orderNumber: (await orderCollection.countDocuments()) + 1,
      orderDate: new Date(),
      addressChosen: JSON.parse(JSON.stringify(addressData[0])),
      cartData: await grandTotal(req),
      grandTotalCost: req.session.grandTotal,
    });
    let userCartData = await grandTotal(req);
    console.log(addressData);
    res.render("users/checkoutPage", {
      signIn: req.session.signIn,
      user: req.body.user,
      currentUser: req.session.currentUser,
      grandTotal: req.session.grandTotal,
      userCartData,
      cartData,
      addressData: req.session.addressData,
      addressData,
    });
  } catch (error) {
    res.redirect("/cart");
  }
};

const orderPlaced = async (req, res) => {
  console.log('q');
  try {
    console.log(req.session.grandTotal);
    if (req.body.razorpay_payment_id) {
      //razorpay payment
      // await orderCollection.updateOne(
      //   { _id: req.session.currentOrder._id },
      //   {
      //     $set: {
      //       paymentId: req.body.razorpay_payment_id,
      //       paymentType: "Razorpay",
      //     },
      //   }
      // );
      // res.redirect("/checkout/orderPlacedEnd");
    } else {
      //incase of COD
      await orderCollection.updateOne(
        { _id: req.session.currentOrder._id },
        {
          $set: {
            paymentId: "generatedAtDelivery",
            paymentType: "COD",
          },
        }
      );
      console.log("ed");
      res.json({ success: true });
    }
  } catch (error) {
    console.error(error);
  }
};

const orderPlacedEnd = async (req, res) => {
  let cartData = await cartCollection
    .find({ userId: req.session.currentUser._id })
    .populate("productId");
  // console.log(cartData);
  console.log("safjkdhf");
  cartData.map(async (v) => {
    v.productId.productStock -= v.productQuantity; //reducing from stock qty
    await v.productId.save();
    return v;
  });
  
  console.log("safjkdhf");
  let orderData= await orderCollection.findOne({ _id: req.session.currentOrder._id})
  if(orderData.paymentType =='toBeChosen'){
    orderData.paymentType = 'COD'
    orderData.save()
  }
  console.log("safjkdhf");
  
  let x = await cartCollection.findByIdAndUpdate({ _id: req.session.currentOrder._id}).populate("productId");
  
  console.log("safjkdhf");


  console.log('StockSold incremented successfully.');
  console.log("rendering next");
  res.render("users/orderPlacedPage", {
    signIn: req.session.signIn,
    user: req.session.user,
    orderCartData: cartData,
    orderData: req.session.currentOrder,
  });
  //delete product from cart since the order is placed
  // await cartCollection.deleteMany({ userId: req.session.currentUser._id });
  // console.log("deleting finished");
};



module.exports = {
  cart,
  addToCart,
  deleteFromCart,
  decQty,
  incQty,
  checkoutPage,
  orderPlaced,
  orderPlacedEnd,
};
