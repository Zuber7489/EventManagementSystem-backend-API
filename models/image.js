const mongoose = require('mongoose');
const { Schema } = mongoose;

const userImage = mongoose.model('userImage', {
    
      image: {type: String},
      userId: { type: Schema.Types.ObjectId, ref: 'Employee' },
});

module.exports = userImage;



