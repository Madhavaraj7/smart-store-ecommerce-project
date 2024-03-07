const couponCollection = require("../models/couponModel.js");
const formatDate = require('../service/formatDateHelper.js')
const productCollection = require("../models/productModel.js");
const categoryCollection = require("../models/categoryModel.js");



const couponManagement = async (req, res) => {
    try {
      let couponData = await couponCollection.find();
      couponData = couponData.map((v) => {
        v.startDateFormatted = formatDate(v.startDate, "YYYY-MM-DD");
        v.expiryDateFormatted = formatDate(v.expiryDate, "YYYY-MM-DD");
        return v;
      });
      res.render("admin/coupon", { couponData });
    } catch (error) {
      console.error(error);
    }
  };

  const addCoupon = async (req, res) => {
    try {
      let existingCoupon = await couponCollection.findOne({
        couponCode: { $regex: new RegExp(req.body.couponCode, "i") },
      });
  
      if (!existingCoupon) {
        await couponCollection.insertMany([
          {
            couponCode: req.body.couponCode,
            discountPercentage: req.body.discountPercentage,
            startDate: new Date(req.body.startDate),
            expiryDate: new Date(req.body.expiryDate),
            minimumPurchase: req.body.minimumPurchase,
            maximumDiscount: req.body.maximumDiscount,
          },
        ]);
        return res.json({ couponAdded: true });
      } else {
        return res.json({ couponCodeExists: true });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  const editCoupon = async (req, res) => {
    try {
      let existingCoupon = await couponCollection.findOne({
        couponCode: { $regex: new RegExp(req.body.couponCode, "i") },
      });
      if (!existingCoupon || existingCoupon._id == req.params.id) {
        let updateFields = {
          couponCode: req.body.couponCode,
          discountPercentage: req.body.discountPercentage,
          startDate: new Date(req.body.startDate),
          expiryDate: new Date(req.body.expiryDate),
          minimumPurchase: req.body.minimumPurchase,
          maximumDiscount: req.body.maximumDiscount,
        };
        await couponCollection.findOneAndUpdate(
          { _id: req.params.id },
          { $set: updateFields }
        );
        return res.json({ couponEdited: true });
      } else {
        return res.json({ couponCodeExists: true });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const deleteCoupon = async (req, res) => {
    try {
        await couponCollection.findByIdAndDelete(req.params.id);
        return res.json({ couponDeleted: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

  

  
  module.exports = {
    couponManagement,
    addCoupon,
    editCoupon,
    deleteCoupon,

  };
  