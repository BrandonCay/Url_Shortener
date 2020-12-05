;
const mongoose=require('mongoose')
const Schema=mongoose.Schema;
const urlSchema=new Schema({
    original_url:String,
    short_url:String,
    date:Date
})

module.exports = mongoose.model('urls',urlSchema);

