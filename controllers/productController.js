const categoryCollection = require("../models/categoryModel");
const productCollection = require("../models/productModel");



const productlist= async (req, res) => {
    try {

        let page = Number(req.query.page) || 1;
        let limit = 4;
        let skip = (page - 1) * limit;
    
        let   count = await productCollection.find().estimatedDocumentCount();
    
        let productData = await productCollection.find().skip(skip).limit(limit);
        let categoryList = await categoryCollection.find(
          {},
          { categoryName: true }
        );
    
        res.render("admin/productlist.ejs", {
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
  
      console.log(categories);
      res.render("admin/addproduct.ejs", {
        categories,
      });
      req.session.productAlreadyExists = null;
    } catch (error) {
      console.error(error);
    }
  };

  const addProduct = async (req, res) => {

    console.log(productCollection);
    try {
      let existingProduct = await productCollection.findOne({
        productName: { $regex: new RegExp(req.body.productName, "i") },
         productName: req.body.productName,
      });
      if (!existingProduct) {
        console.log("in");
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
        // console.log(req.files[0].filename);
        res.redirect("/admin/products");
      } else {
        console.log("out");
        req.session.productAlreadyExists = existingProduct;
        res.redirect("/admin/addproduct");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const editProductpage = async (req, res) => {
    try {
      console.log("editpage");
      const productId = req.params.id;
      console.log(productId);
      const productData = await productCollection.findOne({_id:productId}); 
      const categories = await categoryCollection.find({})
      console.log(categories);
      res.render("admin/editproduct.ejs", {
        productData,categories
        // productExists: req.session.productAlreadyExists,
      });
    } catch (error) {
      console.error( error);
    }
  };
  
  const editProduct = async (req, res) => {
    console.log("edit");
    try {
      let existingProduct = await productCollection.findOne({
        productName: { $regex: new RegExp(req.body.productName, "i") },
      });
      if (!existingProduct || existingProduct._id == req.params.id) {
        console.log("edit1");
  
        const updateFields = {
          $set: {
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
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
        console.log("edit3");
  
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
    console.log("delete");
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