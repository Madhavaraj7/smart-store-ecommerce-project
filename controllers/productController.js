const categoryCollection = require("../models/categoryModel");
const productCollection = require("../models/productModel");
const mongoose = require('mongoose');




const productlist= async (req, res) => {
    try {

        let page = Number(req.query.page) || 1;
        let limit = 12;
        let skip = (page - 1) * limit;
    
        let   count = await productCollection.find().estimatedDocumentCount();
    
        let productData = await productCollection.find().populate("parentCategory").skip(skip).limit(limit);
        let categoryList = await categoryCollection.find(
          {},
          { categoryName: true }
        );
    
        res.render("admin/productList.ejs", {
          productData,
          categoryList,count,
          limit,
          productExist: req.session.productAlreadyExists,
        });
        req.session.productAlreadyExists = null;
      } catch (error) {
        console.error(error);
      }
  };

  const addProductPage = async (req, res) => {
    try {
      const categories = await categoryCollection.find({ isListed:true});
  
      res.render("admin/addproduct.ejs", {
        categories,
      });
      req.session.productAlreadyExists = null;
    } catch (error) {
      console.error(error);
    }
  };

  const addProduct = async (req, res) => {

    try {
      let existingProduct = await productCollection.findOne({
        productName: { $regex: new RegExp(req.body.productName, "i") },
         productName: req.body.productName,
      });
      if (!existingProduct) {
        await productCollection.insertMany([
          {
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productImage1: req.files[0].filename,
            productImage2: req.files[1].filename,
            productImage3: req.files[2].filename,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock,
          },
        ]);
        res.redirect("/admin/products");
      } else {
        req.session.productAlreadyExists = existingProduct;
        res.redirect("/admin/addproduct");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const editProductpage = async (req, res) => {
    try {
      const productId = req.params.id;
      const productData = await productCollection.findOne({_id:productId}); 
      const categories = await categoryCollection.find({})
      res.render("admin/editproduct.ejs", {
        productData,categories
        // productExists: req.session.productAlreadyExists,
      });
    } catch (error) {
      console.error( error);
    }
  };
  
  const editProduct = async (req, res) => {
    try {
      let existingProduct = await productCollection.findOne({
        productName: { $regex: new RegExp(req.body.productName, "i") },
      });
      if (!existingProduct || existingProduct._id == req.params.id) {
  
        const updateFields = {
          $set: {
            productName: req.body.productName,
            parentCategory: new mongoose.Types.ObjectId(req.body.category),
            productPrice: req.body.productPrice,
            productStock: req.body.productStock,
          },
        };
  
        if (req.files[0]) {
          updateFields.$set.productImage1 = req.files[0].filename;
        }
  
        if (req.files[1]) {
          updateFields.$set.productImage2 = req.files[1].filename;
        }
  
        if (req.files[2]) {
          updateFields.$set.productImage3 = req.files[2].filename;
        }
  
        await productCollection.findOneAndUpdate(
          { _id: req.params.id },
          updateFields
        );
  
        res.redirect("/admin/products");
      } else {
        req.session.productAlreadyExists = existingProduct;
        res.redirect("/admin/products");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const listProduct = async (req, res) => {
    try {
      await productCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: true } }
      );
      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
    }
  };
  const unListProduct = async (req, res) => {
    try {
      await productCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: false } }
      );
      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProduct = async (req, res) => {
    try {
      await productCollection.findOneAndDelete({ _id: req.params.id });
      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
    }
  };
  
  module.exports = {
    productlist,
    addProductPage,
    addProduct,
    editProductpage,
    editProduct,
    listProduct,
    unListProduct,
    deleteProduct,
  
  
    

    

    
  };