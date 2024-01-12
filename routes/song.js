const express=require('express');
const passport= require('passport');
const Song = require('../models/Song');
const User = require('../models/User');
const app=express();
app.use(express.json()) //Incoming all data will be get converted in JSON Format
const router=express.Router();
 

router.post('/create',passport.authenticate("jwt",{session:false}),
async (req,res)=>{
    const {name,thumbnail,track,duration}=req.body;
    if(!name || !thumbnail || !track || !duration){
        return res.status(301).json({err:"Insufficient data to create song"})
    }
    const artist=req.user._id
    const songDetails={name,thumbnail,track,artist,duration}
    const createdSong=await Song.create(songDetails)
    return res.status(200).json(createdSong)
})


router.get('/get/mysongs',passport.authenticate("jwt",{session:false}),
async(req,res)=>{
    //we need to get all songs where artist.id===currentUser.id
    const songs=await Song.find({artist: req.user._id}).populate("artist")
    return res.status(200).json({data:songs})
})


//get route to get all songs by any artist has published
//we will send the artist ID and want to see all songs by that artist
router.get('/get/artist/:artistId',passport.authenticate("jwt",{session:false}),
async (req,res)=>{
    const {artistId}=req.params
    const artist=await User.findOne({_id:artistId})
    if(!artist)
    {
        return res.status(301).json({err:"Artist Does Not Exist"})
    }
    const songs=await Song.find({artist:artistId})
    return res.status(200).json({data:songs})
})

//GEt route to get a single song by name
router.get('/get/songname/:songName',passport.authenticate("jwt",{session:false}),
async (req,res)=>{
    const {songName}=req.params
    const songs=await Song.find({name:songName}).populate('artist')
    return res.status(200).json({data:songs})
})
module.exports=router