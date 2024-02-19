const CategoryOfferModel = require("../models/categoryOfferModel");
const ProductModel = require("../models/productModel");






const applyCategoryOffer = async () => {
    try {
      const today = new Date();
  
      const offers = await CategoryOfferModel.find({ isAvailable: true });
  
      const allProducts = await ProductModel.find();
  
      for (const prod of allProducts) {
        const currentOffer = offers.find(
          (offer) => String(offer.category) === String(prod.category)
        );
  
        if (
          currentOffer &&
          currentOffer.startDate <= today &&
          currentOffer.endDate >= today
        ) {
          await ProductModel.findByIdAndUpdate(prod._id, {
            offerPrice: Math.floor(
              prod.price - (prod.price * currentOffer.offerPercentage) / 100
            ),
          });
        } else {
          await ProductModel.findByIdAndUpdate(prod._id, {
            offerPrice: prod.price,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };


  module.exports = { applyCategoryOffer };
