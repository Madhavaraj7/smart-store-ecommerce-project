const mongoose= require('mongoose')


const userSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phonenumber: {
      type: Number,
      required: true,
    },
    password: {
    type: String,
    required: true,
    },
    is_verified: {
      type: Number,
      default: 1,
    },
    is_admin: { 
    type: Number, 
    default: false
    },
    token:{
    type:String,
    default:''
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    referralCode: { type: String, default: null }

   


  });

const user=mongoose.model('userdatas', userSchema)

module.exports= user;

// module.exports = mongoose.model("User", userSchema);
