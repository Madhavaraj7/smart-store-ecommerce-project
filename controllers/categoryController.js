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
  req.session.categoryExists;
  res.render("admin/addCategory.ejs", {
    categoryExists: req.session.categoryExists,
  });
  req.session.categoryExists = false;
  req.session.save();
};

const addCategory = async (req, res) => {
  try {
    let categoryName = req.body.categoriesName;
    let categoryExists = await categoryCollection.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
    });
    if (!categoryExists) {
      await new categoryCollection({
        categoryName: req.body.categoriesName,
        categoryDescription: req.body.categoriesDescription,
      }).save();
      res.redirect("/admin/categories");
    } else {

      req.session.categoryExists = true;

      res.redirect("/admin/addCategories");
    }
  } catch (error) {
    console.error("Error adding category:", error);
  }
};

const editCategory = async (req, res) => {
  req.session.categoryExists;

  try {
    let data = await categoryCollection.findOne({ _id: req.params.id });

    res.render("admin/editCategory.ejs", {
      data: data,
      categoryExists: req.session.categoryExists,
    });
    req.session.categoryExists = false;
   req.session.save();
  } catch (error) {
    console.error(error);
  }
};

const editCategoriesPage = async (req, res) => {
  try {
    let categoryName = req.body.categoriesName;
    let categoryExists = await categoryCollection.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
    });
    if (!categoryExists) {
      await categoryCollection.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            categoryName: req.body.categoriesName,
            categoryDescription: req.body.categoriesDescription,
          },
        }
      );
      res.redirect("/admin/categories");
    } else {

      req.session.categoryExists = true; 
      res.redirect('back');
    }
  } catch (error) {
    console.error("Error adding category:", error);
  }
};

const deleteCategory = async (req, res) => {
  try {
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
