const express = require("express");
const router = express.Router();
const passport = require("passport");
const Playlist = require("../models/Playlist");
const User = require("../models/User");
const Song = require("../models/Song");
//Route 1 : Create a playlist

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentUser = req.user;
    const { name, thumbnail, songs } = req.body;
    if (!name || !thumbnail || !songs) {
      return res
        .status(301)
        .json({ err: "Insufficient data to create Playlist" });
    }
    const playlistData = {
      name,
      thumbnail,
      songs,
      owner: currentUser._id,
      collaborators: [],
    };
    const createdPlaylist = await Playlist.create(playlistData);
    return res.status(200).json(createdPlaylist);
  }
);

//Route 2 : Get a playlist by ID
// we will get the playlist ID as a route parameter and we will return the playlist having that id
// /something1/something2/something3 --> exact match
// /something1/something2/something4 --> this will not call the api on the previus line
// If we are doing /playlist/get/:playlistId  --> this means that playlistId is now a variable to which we can assign any value
// If you call anything of the format /playlist/get/anything (anything can be anything), this api is called
// If you called /playlist/get/anything, the playlistId variable gets assigned the value anyhting.router.get('/get/:playlistID')

router.get(
  "/get/playlist/:playlistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const playlistId = req.params.playlistId;
    const playlist = await Playlist.findOne({ _id: playlistId }).populate({
      path: "songs",
      populate: {
        path: "artist",
      },
    });
    if (!playlist) {
      return res.status(301).json({ err: "Inavlid ID" });
    }
    return res.status(200).json(playlist);
  }
);

//Get all playlists made by Me
router.get(
  "/get/me",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const artistId = req.user._id;

    const playlist = await Playlist.find({ owner: artistId }).populate("owner");
    return res.status(200).json({ data: playlist });
  }
);
//Get all playlists made by an artist
router.get(
  "/get/artist/:artistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const artistId = req.params.artistId;

    const artist = await User.find({ _id: artistId });
    if (!artist) {
      return res.status(303).json({ err: "Invalid Artist ID" });
    }

    const playlist = await Playlist.find({ owner: artistId });
    return res.status(200).json({ data: playlist });
  }
);

router.get(
  "/get/all",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const users = await User.find({});

    // Extract the user IDs from the users array
    const userIds = users.map((user) => user._id);

    return res.status(200).json({ data: userIds });
  }
);

//Add a song to a Playlist
router.post(
  "/add/song",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentUser = req.user;
    const { playlistId, songId } = req.body;
    //Step 1 : Check if currentUser is owner of the playlist or collaborator
    const playlist = await Playlist.findOne({ _id: playlistId });
    if (!playlist) {
      return res.status(304).json({ err: "Playlist does not exist" });
    }
    // console.log(playlist.owner)
    // console.log(currentUser._id)
    // console.log(playlist.owner.equals(currentUser._id))
    if (
      !playlist.owner.equals(currentUser._id) &&
      !playlist.collaborators.includes(currentUser._id)
    ) {
      return res.status(400).json({ err: "Not Allowed" });
    }
    //Step 2: Check if the song is valid
    const song = await Song.findOne({ _id: songId });
    if (!song) {
      return res.status(304).json({ err: "Song does not exist" });
    }
    //Step 3: We can add a song in Playlist
    playlist.songs.push(songId);
    await playlist.save();
    return res.status(200).json(playlist);
  }
);
module.exports = router;
