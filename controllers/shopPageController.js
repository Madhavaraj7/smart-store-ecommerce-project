const categoryCollection = require("../models/categoryModel");
const productCollection = require("../models/productModel");



module.exports={
    shopPage: async (req, res) => {
        try {
          let categoryData = await categoryCollection.find({isListed: true});
    
          let productsInOnePage = 3
          let pageNo = req.query.pageNo ||  1
          let skip= (pageNo-1) * productsInOnePage 
          let limit= productsInOnePage
          let productDataWithPagination= await productCollection.find({ isListed: true }).skip(skip).limit(limit)
          
          let productData =
            req.session?.shopProductData || productDataWithPagination;
            
    
          let totalPages=  Math.ceil(  await productCollection.countDocuments() / productsInOnePage )
          console.log(totalPages);
          let totalPagesArray = new Array(totalPages).fill(null)
    
          res.render("users/productlist", {  currentUser: req.session.currentUser, categoryData, productData, totalPagesArray ,_id: req.session.user_id ,});
          req.session.shopProductData = null;
          req.session.products = null;
          req.session.save();
        } catch (error) {
          console.error(error);
        }
      },

filterCategory: async (req, res) => {
        try {
          req.session.shopProductData = await productCollection.find({
            isListed: true,
            parentCategory: req.params.categoryName,
          }).populate("parentCategory");
          res.redirect("/productList");
        } catch (error) {
          console.error(error);
        }
      },

      filterPriceRange: async (req, res) => {
          try {
            req.session.shopProductData = await productCollection.find({
              isListed: true,
              productPrice: {
                $gt: 0 + 1000 * req.query.priceRange,
                $lte: 1000 + 4000 * req.query.priceRange,
              },
            });
            res.redirect("/productList");
          } catch (error) {
            console.error(error);
          }
},
sortPriceAscending: async (req, res) => {
    try {
      req.session.shopProductData = await productCollection
        .find({ isListed: true })
        .sort({ productPrice: 1 });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
    }
  },
  sortPriceDescending: async (req, res) => {
    try {
      req.session.shopProductData = await productCollection
        .find({ isListed: true })
        .sort({ productPrice: -1 });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
    }
  },

  searchUserProductController : async (req, res) => {
    try {
      const { search } = req.body;
      console.log("search : ",search);
      const products = await productCollection.find({
        $or: [
          { productName: { $regex: search, $options: "i" } },
        ],
      }).populate("parentCategory");
      console.log(products);
      req.session.shopProductData = products;
      res.redirect("/productList");
    } catch (error) {
      console.log(error);
    }
  },
  
}