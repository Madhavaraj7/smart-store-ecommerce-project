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
    coupon: {
		type: mongoose.Schema.ObjectId,
		ref: 'coupons',
	},
    discountAmount: {
		type: mongoose.Schema.ObjectId,
        ref:'products'
	},

})

const orderCollection= mongoose.model( 'orders', orderSchema )

module.exports= orderCollection