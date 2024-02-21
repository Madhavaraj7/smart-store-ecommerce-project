const categoryCollection = require("../models/categoryModel");
const mongoose = require("mongoose");

const categoriesPage = async (req, res) => {
    try {
      let page = Number(req.query.page) || 1;
      let limit = 8;
      let skip = (page - 1) * limit;
  
      let count = await categoryCollection.find().estimatedDocumentCount();
  
      let categoryData = await categoryCollection.find().skip(skip).limit(limit);
      res.render("admin/Category.ejs", {
        categoryData,
        count,
        limit,
        categoryExists: req.session.categoryExists,
      });
      req.session.categoryExists = null;
    } catch (error) {
      console.error(error);
    }
  };

  const addCategoriesPage = async (req, res) => {
    res.render("admin/addCategory.ejs");
  };
  


  const addCategory = async (req, res) => {
    try {
      let categoryName = req.body.categoriesName;
      let categoryExists = await categoryCollection.findOne({
        categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
      });
      console.log(categoryExists);
      console.log(req.body);
      if (!categoryExists) {
        await new categoryCollection({
          categoryName: req.body.categoriesName,
          categoryDescription: req.body.categoriesDescription,
        }).save();
        console.log("Added category");
        res.redirect("/admin/categories");
      } else {
        console.log("Category already exists!");
  
        req.session.categoryExists = categoryExists;
        res.redirect("/admin/categories");
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };


  const editCategory = async (req, res) => {
    try {
      console.log(req.params.id);
      let data = await categoryCollection.findOne({ _id: req.params.id });
  
      res.render("admin/editCategory.ejs", { data: data });
    } catch (error) {
      console.error(error);
    }
  };
  


  const editCategoriesPage = async (req, res) => {
    try {
      
      console.log(req.body);
      let categoryName = req.body.categoriesName;
      let categoryExists = await categoryCollection.findOne({
        categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
      });
      if(!categoryExists){
  
        await categoryCollection.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            categoryName: req.body.categoriesName,
            categoryDescription: req.body.categoriesDescription,
          },
        }
      );
      // console.log();
      res.redirect("/admin/categories");
      }else{
  
          console.log("Category already exists!");
    
          req.session.categoryExists = categoryExists;
          res.redirect("/admin/categories");
      }
    } catch (error) {
      console.error("Error adding category:", error);


      
    }
  };

  const deleteCategory = async (req, res) => {
    try {
      console.log(req.body);
      await categoryCollection.findOneAndDelete({ _id: req.params.id });
      res.redirect("/admin/categories");
    } catch (error) {
      console.error(error);
    }
  };

  const listCategory = async (req, res) => {
    try {
      await categoryCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: true } }
      );
      res.redirect("/admin/categories");
    } catch (error) {
      console.error(error);
    }
  };

  const unlistCategory = async (req, res) => {
    try {
      console.log(req.params.id);
      await categoryCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: false } }
      );
      res.redirect("/admin/categories");
    } catch (error) {
      console.error(error);
    }
  };
  

  module.exports = {
    categoriesPage,
    addCategory,
    addCategoriesPage,
    editCategory,
    editCategoriesPage,
    deleteCategory,
    listCategory,
    unlistCategory,
    

    

    
  };