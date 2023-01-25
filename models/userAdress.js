const mongoose = require('mongoose');
const { Schema } = mongoose;


const Address = mongoose.model('Address', {
  type: { type: String },
  pincode: { type: Number },
  state: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  userAddress: [{

    type: { type: String },
    pincode: Number, state: String
  }]
});

module.exports = Address;