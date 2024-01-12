const mongoose=require('mongoose')

//create mongoose schema

const Song=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
    },
    track:{
        type:String,
        required:true,
    },
    artist:{
        type:mongoose.Types.ObjectId,
        ref:"User",
    },
    duration:{
        type:String,
        required:true,
    },
})

const SongModel=mongoose.model("Song",Song)

module.exports=SongModel  