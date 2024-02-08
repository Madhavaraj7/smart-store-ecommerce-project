const bcrypt = require("bcrypt");
const userCollection = require("../models/userModel");
const addressCollection = require("../models/addressModel");



module.exports = {
  //account
  accountPage: async (req, res) => {
    try {
      let userData = await userCollection.findOne({
        _id: req.session.currentUser._id,
      });
    

     
      res.render("users/account", {
        currentUser: req.session.currentUser,
        userData,
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
      console.log(existingAddress);
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

  changePasswordPatch :async (req, res) => {
    try {
      console.log(req.body.password);
      console.log(req.session.user);
  
      await userCollection.updateOne(
        {    user_id : req.body.user_id},
        { $set: { password: req.body.password } }
      );
      console.log("1234567");
      res.json({ success: true });
    } catch (error) {
      console.error(error);
    }
  }
}
