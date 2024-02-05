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
      let existingcategory = await categoryCollection.findOne({
        categoryName: { $regex: new RegExp(req.body.categoryName, "i") },
        categoryName: req.body.categoryName,
      });console.log(existingcategory);
  
      if (!existingcategory) {
        await categoryCollection.insertMany([
          {
            categoryName: req.body.categoriesName,
            categoryDescription: req.body.categoriesDescription,
          },
        ]);
      }
      res.redirect("/admin/categories");
    } catch (error) {
      console.error(error);
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
    console.log(req.body);
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