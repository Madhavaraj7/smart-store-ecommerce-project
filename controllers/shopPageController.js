const categoryCollection = require("../models/categoryModel");
const productCollection = require("../models/productModel");



module.exports={
    shopPage: async (req, res) => {
      try {
        let page = Number(req.query.page) || 1;
        let limit = 8;
        let skip = (page - 1) * limit;
        let productData =
          req.session?.shopProductData?.slice(skip, limit*page )
           ||
          (await productCollection
            .find({ isListed: true })
            .skip(skip)
            .limit(limit));
    
        if (req.session.user) {
          cartData = await cartCollection
            .find({ userId: req.session?.currentUser?._id })
            .populate("productId");
        } else {
          cartData = [];
        }
        let categoryData = await categoryCollection.find({ isListed: true });
        // let productData = await productCollection
        //   .find({ isListed: true })
        //   .skip(skip)
        //   .limit(limit)
    
        let count;
        if (req.session && req.session.shopProductData) {
          count = req.session.shopProductData.length;
        } else {
          count = await productCollection.countDocuments({ isListed: true });
        }
    
        let totalPages = Math.ceil(count / limit);
        let totalPagesArray = new Array(totalPages).fill(null);
        res.render("users/productlist", {
          categoryData,
          productData,
          currentUser: req.session.currentUser,
          user: req.session.user,
          count,
          limit,
          totalPagesArray,
          currentPage: page,
          selectedFilter: req.session.selectedFilter,
          selectedFilter: req.session.selectedFilter,
          cartData,
        });
    
        console.log(req.session.currentUser);
      } catch (error) {
        console.error("Error fetching product data:", error);
        res.status(500).send("Internal Server Error");
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
      req.session?.shopProductData?.sort( (a,b)=>b.productPrice-a.productPrice  ) || await productCollection
        .find({ isListed: true })
        .sort({ productPrice: 1 });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
    }
  },
  sortPriceDescending: async (req, res) => {
    try {
      req.session?.shopProductData?.sort( (a,b)=>a.productPrice-b.productPrice  ) || await productCollection
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