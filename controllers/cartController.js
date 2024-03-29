const cartCollection = require("../models/cartModel.js");
const userCollection = require("../models/userModel.js");
const productCollection = require("../models/productModel.js");
const profileCollection = require("../models/addressModel.js");

const productModel = require("../models/productModel.js");
const CartModel = require("../models/cartModel.js");
const orderCollection = require("../models/orderModel.js");
const couponCollection = require("../models/couponModel.js");
const walletCollection = require("../models/walletModel.js");
const razorpay = require("../service/razorpay.js");



async function grandTotal(req) {
  try {
    let userCartData = await cartCollection
      .find({ userId: req.session.currentUser._id })
      .populate("productId");
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


    res.render("users/cart", {
      signIn: req.session.signIn,
      user: req.body.user,
      
      currentUser: req.session.currentUser,
      userCartData,
      grandTotal: req.session.grandTotal,
    });
  } catch (error) {
    console.error("Error in cart:", error);
    // res.status(500).send("Internal Server Error");
    // res.redirect('/loginpage')
  }
};

const addToCart = async (req, res) => {
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

    res.redirect("/cart");
    // res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);

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

    const coupons = await couponCollection.find(); 
    if (addressData.length > 0) {
      req.session.currentOrder = await orderCollection.create({
        userId: req.session.currentUser._id,
        orderNumber: (await orderCollection.countDocuments()) + 1,
        orderDate: new Date(),
        addressChosen: JSON.parse(JSON.stringify(addressData[0])),
        cartData: await grandTotal(req),
        grandTotalCost: req.session.grandTotal,
      });
      let userCartData = await grandTotal(req);
      res.render("users/checkoutPage", {
        signIn: req.session.signIn,
        user: req.body.user,
        currentUser: req.session.currentUser,
        grandTotal: req.session.grandTotal,
        userCartData,
        cartData,
        addressData: req.session.addressData,
        addressData,
        coupons: coupons 
      });

    }else{
        req.session.addressPageFrom = "cart";
        res.redirect("/account/addAddress");
    }

  } catch (error) {
    res.redirect("/cart");
  }
};

const razorpayCreateOrderId= async (req, res) => {

  if(req.query?.combinedWalletPayment){

    let walletData = await walletCollection.findOne({userId: req.session.currentUser._id})

    var options = {
      amount: req.session.grandTotal - walletData.walletBalance  + "00", 
      currency: "INR",
    };


  }else{

    var options = {
      amount: req.session.grandTotal + "00", 
      currency: "INR",
    };
  }


  razorpay.instance.orders.create(options, function (err, order) {
    res.json(order);
  });
}

const orderPlaced = async (req, res) => {
  try {
    if (req.body.razorpay_payment_id) {
      //razorpay payment
      await orderCollection.updateOne(
        { _id: req.session.currentOrder._id },
        {
          $set: {
            paymentId: req.body.razorpay_payment_id,
            paymentType: "Razorpay",
          },
        }
      );
      res.redirect("/checkout/orderPlacedEnd");
    } else if (req.body.walletPayment) {
      const walletData = await walletCollection.findOne({
        userId : req.session.currentUser._id,
      });
      if (walletData.walletBalance >= req.session.grandTotal) {
        walletData.walletBalance -= req.session.grandTotal;

        // wallet tranaction data 
        let walletTransaction = {
          transactionDate : new Date(),
          transactionAmount: -req.session.grandTotal,
          transactionType: "Debited for placed order",
        };
        walletData.walletTransaction.push(walletTransaction)
        await walletData.save();

        await orderCollection.updateOne(
          { _id: req.session.currentOrder._id },
          {
            $set: {
              paymentId: Math.floor(Math.random() * 9000000000) + 1000000000 ,
              paymentType: "Wallet",
            },
          })

        res.json({ success: true });
      } else {
        return res.json({ insufficientWalletBalance: true });
      }
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


    for (const item of cartData) {
    item.productId.productStock -= item.productQuantity; // we use for reducing Qyantity
    item.productId.stockSold += 1;  //stocjSolf ++
    await item.productId.save();
  }
  
  
  let orderData= await orderCollection.findOne({ _id: req.session.currentOrder._id})
  if(orderData.paymentType =='toBeChosen'){
    orderData.paymentType = 'COD'
    orderData.save()
  }
  
  let x = await cartCollection.findByIdAndUpdate({ _id: req.session.currentOrder._id}).populate("productId");
  



  res.render("users/orderPlacedPage", {
    signIn: req.session.signIn,
    user: req.session.user,
    orderCartData: cartData,
    orderData: req.session.currentOrder,
  });
  //delete product from cart since the order is placed
  await cartCollection.deleteMany({ userId: req.session.currentUser._id });
};





const applyCoupon = async (req, res) => {
  try {
    let { couponCode } = req.body;

    const userId = req.session.currentUser._id;
    let couponData = await couponCollection.findOne({ couponCode });

    if (!couponData) {
      return res.status(501).json({ couponApplied: false });
    }

    if (couponData.userId.includes(userId)) {
      return res.status(501).json({ couponApplied: false, couponAlreadyUsed: true });
    }

    let { grandTotal } = req.session;
    let { minimumPurchase, expiryDate } = couponData;
    let minimumPurchaseCheck = minimumPurchase < grandTotal;
    let expiryDateCheck = new Date() < new Date(expiryDate);
  

    if (minimumPurchaseCheck && expiryDateCheck) {

      let { discountPercentage, maximumDiscount } = couponData;
      let discountAmount =
        (grandTotal * discountPercentage) / 100 > maximumDiscount
          ? maximumDiscount
          : (grandTotal * discountPercentage) / 100;

      let { currentOrder } = req.session;
      await orderCollection.findByIdAndUpdate(
        { _id: currentOrder._id },
        {
          $set: { couponApplied: couponData._id },
          $inc: { grandTotalCost: -discountAmount },
        }
      );

      req.session.grandTotal -= discountAmount;

      await couponCollection.findByIdAndUpdate({_id: couponData._id}, { $push: { userId: userId } });

      res.status(202).json({ couponApplied: true, discountAmount });
    } else {
      res.status(501).json({ couponApplied: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};



const storedApplycoupon =  async (req, res) => {
  try {
      const { orderId, discountAmount } = req.body;
      
      await orderCollection.findByIdAndUpdate(orderId, { totalDiscount: discountAmount });
      res.sendStatus(200); 
  } catch (error) {
      console.error('Error storing discount in order:', error);
      res.status(500).send('Internal Server Error'); 
  }
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
  applyCoupon,
  razorpayCreateOrderId,
  storedApplycoupon,
};
