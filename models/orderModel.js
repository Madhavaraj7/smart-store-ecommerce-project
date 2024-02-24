const mongoose= require('mongoose')

const orderSchema= new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true,},
    orderNumber: { type: Number, required: true},
    orderDate: { type: Date, required:true, default: new Date()},
    paymentType: {type: String, default:'toBeChosen'},
    orderStatus: {type: String, default:'Pending'},
    addressChosen : { type: mongoose.Types.ObjectId, required: true, ref: 'addresses'},
    cartData: { type: Array},
    grandTotalCost: { type: Number},
    paymentId: {type: String,},
    totalOrders: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    totalCouponDeduction: { type: Number, default: 0 },
    
    productOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'productOffers' }],
    couponOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'coupons' }],
  cancelReason:{type:String,default:null},
  ReturnReason:{type:String,default:null},
})

const orderCollection= mongoose.model( 'orders', orderSchema )

module.exports= orderCollection