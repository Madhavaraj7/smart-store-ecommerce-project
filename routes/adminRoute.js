//requiring express
const express = require("express");
const adminRoute = express();

const { isAdmin } = require("../middleware/adminMiddlewares");
const multer = require("multer");
const path = require("path");
const upload = require("../service/multer.js");

const adminController = require("../controllers/adminController"); //requiring userController module
const categorieyController = require("../controllers/categoryController"); //requiring userController module
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController.js");
const salesReportController = require("../controllers/salesReportController.js");
const couponController = require("../controllers/couponController.js");
const offerController = require("../controllers/offerControl.js");

// -------------------------------------------------------Admin login & logout------------------------------------------------------------------------------

adminRoute.get("/", adminController.loadLogin);
adminRoute.post("/", adminController.verifyLogin);
adminRoute.get("/adminHome", isAdmin, adminController.adminHome);
adminRoute.get("/logout", adminController.adminLogout);

// -------------------------------------------------------USER MANAGEMENT------------------------------------------------------------------------------

adminRoute.get("/userManagement", isAdmin, adminController.userListController);
adminRoute.get(
  "/unblock-user/:id",
  isAdmin,
  adminController.unblockUserController
);
adminRoute.get("/block-user/:id", isAdmin, adminController.blockUserController);

// -------------------------------------------------------CATEGOREY MANAGEMENT------------------------------------------------------------------------------

adminRoute.get("/categories", isAdmin, categorieyController.categoriesPage);
adminRoute.get(
  "/addCategories",
  isAdmin,
  categorieyController.addCategoriesPage
);
adminRoute.post("/categories/add", isAdmin, categorieyController.addCategory);
adminRoute.get(
  "/categories/edit/:id",
  isAdmin,
  categorieyController.editCategory
);
adminRoute.post(
  "/editCategories/:id",
  isAdmin,
  categorieyController.editCategoriesPage
);
adminRoute.get(
  "/categories/delete/:id",
  isAdmin,
  categorieyController.deleteCategory
);
adminRoute.post(
  "/categories/list/:id",
  isAdmin,
  categorieyController.listCategory
);
adminRoute.post(
  "/categories/unlist/:id",
  isAdmin,
  categorieyController.unlistCategory
);

// -------------------------------------------------------PRODUCT MANAGEMNET------------------------------------------------------------------------------

adminRoute.get("/products", isAdmin, productController.productlist);
adminRoute.get("/addProduct", isAdmin, productController.addProductPage);
adminRoute.post("/addproduct", upload.any(), productController.addProduct);
adminRoute.get("/productEdit/:id", isAdmin, productController.editProductpage);
adminRoute.post(
  "/editProduct/:id",
  isAdmin,
  upload.any(),
  productController.editProduct
);
adminRoute.post("/unlist/:id", isAdmin, productController.unListProduct);
adminRoute.post("/list/:id", isAdmin, productController.listProduct);
adminRoute.get("/deleteProduct/:id", isAdmin, productController.deleteProduct);

// -------------------------------------------------------ORDER MANAGEMENT------------------------------------------------------------------------------

adminRoute.get("/orderManagement", orderController.orderManagement);
adminRoute.get(
  "/orderManagement/pending/:id",
  orderController.changeStatusPending
);
adminRoute.get(
  "/orderManagement/shipped/:id",
  orderController.changeStatusShipped
);
adminRoute.get(
  "/orderManagement/delivered/:id",
  orderController.changeStatusDelivered
);
adminRoute.get(
  "/orderManagement/return/:id",
  orderController.changeStatusReturn
);
adminRoute.get(
  "/orderManagement/cancelled/:id",
  orderController.changeStatusCancelled
);
adminRoute.get(
  "/orderManagement/cancelled/:id",
  orderController.changeStatusCancelled
);
adminRoute.get(
  "/orderManagement/orderStatus/:id",
  orderController.orderStatusPage
);

// -------------------------------------------------------SALES REPORT------------------------------------------------------------------------------

adminRoute.get("/salesReport", salesReportController.salesReport);
adminRoute.post("/salesReport/filter", salesReportController.salesReportFilter);
adminRoute.get(
  "/salesReport/download/xlsx",
  salesReportController.salesReportDownload
);

// -------------------------------------------------------Coupon Managementt------------------------------------------------------------------------------

adminRoute.get("/couponManagement", couponController.couponManagement);
adminRoute.post("/couponManagement/addCoupon", couponController.addCoupon);
adminRoute.put("/couponManagement/editCoupon/:id", couponController.editCoupon);


// -------------------------------------------------------product Offer Managementt------------------------------------------------------------------------------

adminRoute.get("/productOfferManagement", offerController.productOfferManagement);
adminRoute.post("/productOfferManagement/addOffer",offerController.addOffer);
adminRoute.put("/productOfferManagement/editOffer/:id", offerController.editOffer);
// adminRoute.get("/productoffer-status/:id", offerController.editProductOfferStatus);

// -------------------------------------------------------Category offer Managementt------------------------------------------------------------------------------

// adminRoute.get("/category-offer-list", offerController.getCategoryOffer);
// adminRoute.post("/add-category-offer", offerController.addCategoryOffer);




module.exports = adminRoute;
