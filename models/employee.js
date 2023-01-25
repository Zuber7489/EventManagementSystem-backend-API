const mongoose = require('mongoose');
var validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
};

const Employee = mongoose.model('Employee', {
  name: { type: String },
  position: { type: String },
  dept: { type: String },
  office: { type: String },
  salary: { type: String },
  password: { type: String },
  otp: { type: String },
  address: [{type:String, pincode:Number, state:String}],

  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
}
});

module.exports = Employee;