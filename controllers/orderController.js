const orderCollection = require("../models/orderModel.js");
const userCollection = require("../models/userModel.js");
const walletCollection = require("../models/walletModel")



// order management page
const orderManagement = async (req, res) => {
    try {
      let page = Number(req.query.page) || 1;
      let limit = 15;
      let skip = (page - 1) * limit;
  
      let count = await orderCollection.find().estimatedDocumentCount();
      let orderData = await orderCollection
        .find().sort({orderNumber: -1})
        .populate("userId").skip(skip).limit(limit);

      res.render("admin/orderManagement", { orderData, count, limit, page });
    } catch (error) {
      console.error(error);
    }

  };

// pending
const changeStatusPending = async (req, res) => {
    try {
      await orderCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { orderStatus: "Pending" } }
      );
      res.redirect("/admin/orderManagement");
    } catch (error) {
      console.error(error);
    }
  };

  //shipped
const changeStatusShipped = async (req, res) => {
    try {
      await orderCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { orderStatus: "Shipped" } }
      );
      res.redirect("/admin/orderManagement");
    } catch (error) {
      console.error(error);
    }
  };

  //deliverd
const changeStatusDelivered = async (req, res) => {
    try {
      await orderCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { orderStatus: "Delivered" } }
      );
      res.redirect("/admin/orderManagement");
    } catch (error) {
      console.error(error);
    }
  };
  //return
const changeStatusReturn = async (req, res) => {
    try {
      await orderCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { orderStatus: "Return" } }
      );
      res.redirect("/admin/orderManagement");
    } catch (error) {
      console.error(error);
    }
  };
  
  //cancelled
  const changeStatusCancelled = async (req, res) => {
    try {
      let orderData = await orderCollection
        .findOne({ _id: req.params.id })
        .populate("userId");
      await walletCollection.findOneAndUpdate( { userId : orderData.userId._id  }, { walletBalance: orderData.grandTotalCost })

      await userCollection.findByIdAndUpdate(
        { _id: orderData.userId._id },
        { wallet: orderData.grandTotalCost }
      );
      orderData.orderStatus = "Cancelled";
      orderData.save();
      res.redirect("/admin/orderManagement");
    } catch (error) {
      console.error(error);
    }
  };
  
  // orderStatus
  const orderStatusPage = async (req, res) => {
    try {
      let orderData = await orderCollection
        .findOne({ _id: req.params.id })
        .populate("addressChosen");
      res.render("admin/orderStatus", { orderData, user: req.body.user });
    } catch (error) {
      console.error(error);
    }
  };

  module.exports = {
    orderManagement,
    changeStatusPending,
    changeStatusShipped,
    changeStatusDelivered,
    changeStatusReturn,
    changeStatusCancelled,
    orderStatusPage,
  }

