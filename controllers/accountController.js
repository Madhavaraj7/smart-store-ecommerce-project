const bcrypt = require("bcrypt");
const userCollection = require("../models/userModel");
const addressCollection = require("../models/addressModel");
const orderCollection = require("../models/orderModel");
const formatDate = require("../service/formatDateHelper");
const walletCollection = require("../models/walletModel.js");
const { generateInvoice } = require("../service/generatePDF.js");


const razorpay = require("../service/razorpay.js");

module.exports = {
  //account
  accountPage: async (req, res) => {
    try {
      let userData = await userCollection.findOne({
        _id: req.session.currentUser._id,
      });
      let walletData = await walletCollection.findOne({
        userId: req.session.currentUser._id,
      });

      //sending the formatted date to the page
      if (walletData?.walletTransaction.length > 0) {
        walletData.walletTransaction = walletData.walletTransaction
          .map((v) => {
            v.transactionDateFormatted = formatDate(v.transactionDate);
            return v;
          })
          .reverse(); //reverse is for sorting the latest transactions
      }
      res.render("users/account", {
        currentUser: req.session.currentUser,
        userData,
        walletData,
      });
    } catch (error) {
      console.error(error);
    }
  },

  myAddress: async (req, res) => {
    try {
      const addressData = await addressCollection.find({
        userId: req.session.currentUser._id,
      });
      res.render("users/myAddress", {
        currentUser: req.session.currentUser,
        addressData,
      });
    } catch (error) {
      console.error(error);
    }
  },
  addAddress: async (req, res) => {
    try {
      res.render("users/addAddress", {
        currentUser: req.session.currentUser,
      });
    } catch (error) {
      console.error(error);
    }
  },
  addAddressPost: async (req, res) => {
    try {
      const address = {
        userId: req.session.currentUser._id,
        addressTitle: req.body.addressTitle,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        phone: req.body.phone,
      };
      await addressCollection.insertMany([address]);

      if (req.session.addressPageFrom == "cart") {
        req.session.addressPageFrom = null;
        return res.redirect("/cart");
      }

      return res.redirect("/account/myAddress");
    } catch (error) {
      console.error(error);
    }
  },

  editAddress: async (req, res) => {
    try {
      const existingAddress = await addressCollection.findOne({
        userId: req.session.currentUser._id,
        _id: req.params.id,
      });
      res.render("users/editAddress", {
        currentUser: req.session.currentUser,
        existingAddress,
      });
    } catch (error) {
      console.error(error);
    }
  },

  editAddressPost: async (req, res) => {
    try {
      const address = {
        addressTitle: req.body.addressTitle,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        phone: req.body.phone,
      };
      await addressCollection.updateOne({ _id: req.params.id }, address);

      res.redirect("/account/myAddress");
    } catch (error) {
      console.error(error);
    }
  },
  deleteAddress: async (req, res) => {
    try {
      await addressCollection.deleteOne({ _id: req.params.id });
      res.redirect("/account/myAddress");
    } catch (error) {
      console.log(error);
    }
  },

  changePassword: async (req, res) => {
    try {
      res.render("users/changePassword", {
        invalidCurrentPassword: req.session.invalidCurrentPassword,
      });
    } catch (error) {
      console.error(error);
    }
  },

  changePasswordPatch: async (req, res) => {
    try {

      await userCollection.updateOne(
        { user_id: req.body.user_id },
        { $set: { password: req.body.password } }
      );
      res.json({ success: true });
    } catch (error) {
      console.error(error);
    }
  },

  orderList: async (req, res) => {
    try {
      let orderData = await orderCollection.find({
        userId: req.session.currentUser._id,
      });
      orderData = orderData.filter((order) => order.paymentType !== "toBeChosen");


      //sending the formatted date to the page
      orderData = orderData.map((v) => {
        v.orderDateFormatted = formatDate(v.orderDate);
        return v;
      });

      res.render("users/orderList", {
        currentUser: req.session.currentUser,
        orderData,
      });
    } catch (error) {
      console.error(error);
    }
  },
  orderStatus: async (req, res) => {
    try {
      let orderData = await orderCollection
        .findOne({ _id: req.params.id })
        .populate("addressChosen");
      let isCancelled = orderData.orderStatus == "Cancelled" ? true : false;
      let isReturn = orderData.orderStatus == "Return" ? true : false ;
      res.render("users/orderStatus", {
        currentUser: req.session.currentUser,
        orderData,
        isCancelled,
        isReturn,
      });
    } catch (error) {
      console.error(error);
    }
  },
  downloadInvoice: async (req, res) => {
    try {
      let orderData = await orderCollection
        .findOne({ _id: req.params.id })
        .populate("addressChosen");

      const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment;filename=invoice.pdf",
      });

      generateInvoice(
        (chunk) => stream.write(chunk),
        () => stream.end(),
        orderData
      );
    } catch (error) {
      console.error(error);
    }
  },

  cancelOrder: async (req, res) => {
    try {
      const { cancelReason } = req.body;

      const orderData = await orderCollection.findOne({ _id: req.params.id });

      await orderCollection.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: { orderStatus: "Cancelled", cancelReason } }
      );

      let walletTransaction = {
        transactionDate: new Date(),
        transactionAmount: orderData.grandTotalCost,
        transactionType: "Refund from cancelled Order",
      };

      await walletCollection.findOneAndUpdate(
        { userId: req.session.currentUser._id },
        {
          $inc: { walletBalance: orderData.grandTotalCost },
          $push: { walletTransaction },
        }
      );

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },

  returnRequest: async (req, res) => {
    try {
      const { ReturnReason } = req.body;

      const orderData = await orderCollection.findOne({ _id: req.params.id });

      await orderCollection.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: { orderStatus: "Return", ReturnReason } }
      );

      let walletTransaction = {
        transactionDate: new Date(),
        transactionAmount: orderData.grandTotalCost,
        transactionType: "Refund from cancelled Order",
      };

      await walletCollection.findOneAndUpdate(
        { userId: req.session.currentUser._id },
        {
          $inc: { walletBalance: orderData.grandTotalCost },
          $push: { walletTransaction },
        }
      );

      res.json({ success: true });
    } catch (error) {
      console.error(error);
    }
  },

  razorpayCreateWallet: async (req, res) => {
    const { amount } = req.body;
    req.session.walletCredit= amount

    if (!amount) {
      return res.status(400).json({ error: "Wallet amount is required" });
    }
    const options = {
      amount: amount  + "00",
      currency: "INR",
    };
    razorpay.instance.orders.create(options, function (err, order) {
      res.json(order);
    });
  },


  addRazorpayAmountToWallet: async (req, res) => {
    try {
      
      const userWallet = await walletCollection.findOne({ userId: req.session.currentUser._id });
      if (!userWallet) {
        return res.status(404).json({ error: "User wallet not found" });
      }
  
      const newWalletBalance = userWallet.walletBalance + Number( req.session.walletCredit);


      const walletTransaction = {
        transactionDate: new Date(),
        transactionAmount: req.session.walletCredit,
        transactionType: "Add from Razorpay payment",
      };
  
      await walletCollection.findOneAndUpdate(
        { userId: req.session.currentUser._id },
        {
          $set: { walletBalance: newWalletBalance },
          $push: { walletTransaction },
        }
      );
      res.redirect("/account");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  

}
