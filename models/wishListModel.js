const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
    productId: { type: mongoose.Types.ObjectId, required: true, ref: 'products' },
    
}, );

const wishListCollection = mongoose.model('Wishlist', wishListSchema)

module.exports = wishListCollection