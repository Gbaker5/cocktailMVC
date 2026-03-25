const mongoose = require('mongoose')

const ListsSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    drinkIds: [{
        type: String
    }]   

 
},{timestamps:true})

module.exports = mongoose.model('Lists', ListsSchema)