const express = require('express');
var mongoose = require("mongoose");
const passportlocalmongoose = require('passport-local-mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/Passport")
const userSchema= mongoose.Schema({
  username:String,
  email:String,
  password:String,
  photo:String,
  friends : {
    type : Array,
    default : []
  },
  cart:[{type:mongoose.Schema.Types.ObjectId,ref:"product"}],
  products:[{type:mongoose.Schema.Types.ObjectId , ref:"product"}],
  like:{
    type:Array,
    default:[]
  }
})
userSchema.plugin(passportlocalmongoose);
module.exports = mongoose.model("user", userSchema);