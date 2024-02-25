const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode: { type: String, required: true },
    discountPercentage: { type: Number, min: 5, max: 90, required: true },
    startDate: { type: Date, required: true, default: new Date().toLocaleString() },
    expiryDate: { type: Date, required: true },
    minimumPurchase: { type: Number, required: true },
    maximumDiscount: { type: Number, required: true },
    userId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' } ]// Add a field to store the user ID who used the coupon
});

const couponCollection = mongoose.model('coupons', couponSchema);

module.exports = couponCollection;
