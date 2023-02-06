const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://zuber:zuber@cluster0.18elac7.mongodb.net/?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true}, (err)=>{
    if(!err){
        console.log('Database Connection Successful !!!!!!')
    }else{
        console.log('Error in Connection' + err)
    }
})

module.exports = mongoose;