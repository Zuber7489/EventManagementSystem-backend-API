const mongoose = require('mongoose');
var validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
};
const { Schema } = mongoose;

const Event = mongoose.model('Event', {
  eventtype: { type: String },
  date: { type: Date },
  place: { type: String },
  guest: { type: String },
  foodtype: { type: String },
  decoration: { type: String },
  plan: {type:String},
  Status:{type:Boolean},
  price:{type:String},
  userId:{ type: Schema.Types.ObjectId, ref: 'SignUp' },
  action: {
    type: String,
    enum: ['active', 'inActive'],
    default: 'active'
},
});

module.exports = Event;