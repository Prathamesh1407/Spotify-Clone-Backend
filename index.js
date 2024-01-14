const express=require('express');
const mongoose= require('mongoose');
var JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
const passport=require("passport")
const User=require("./models/User")
const authRoutes=require("./routes/auth");
const songRoutes = require('./routes/song');
const playlistRoutes=require('./routes/playlist')
const app=express();
const cors=require('cors')
require("dotenv").config();
const port=8080

app.use(cors(corsOptions))
app.use(express.json())
const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}


//connect mongoose to node app
mongoose.connect("mongodb+srv://Prathamesh1407:"
    +process.env.MONGO_PASSWORD+
        "@cluster0.s78coer.mongodb.net/?retryWrites=true&w=majority"
        ,
        {
            useNewurlParser:true,
            useUnifiedTopology:true
        }
    ).then((x)=>{
        console.log("Connected to Mongo")
    }).catch((err)=>{
        console.log("Error while Connecting to Mongo")
    })

//setup passport jwt

// let opts = {}
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = 'secret'; 
// passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
//     User.findOne({id: jwt_payload.sub}, function(err, user) {
//         //done(error,DoesUserExist)
//         if (err) {
//             return done(err, false);
//         }
//         if (user) {
//             return done(null, user);
//         } else {
//             return done(null, false);
//             // or you could create a new account
//         }
//     });
// }));


const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
  };
  
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    // Check if the user exists based on the payload information
    User.findById(jwt_payload.identifier,(err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  }));






app.use('/auth',authRoutes); 
app.use('/song',songRoutes);
app.use('/playlist',playlistRoutes)
app.get('/',(req,res)=>{
    res.send('Hello world')
})


app.listen(port,()=>{
    console.log("App is running on port "+port)
})