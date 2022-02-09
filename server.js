require("dotenv").config()

const fs = require("fs")

const express = require("express");

const ejs = require("ejs");

const path = require("path");

const expressLayout = require("express-ejs-layouts");

const session  = require("express-session");

// const mongoose = require("mongoose");

const flash = require("express-flash");

const passport = require("passport");

const MongoDbStore = require("connect-mongo")(session);

const Emitter = require("events")

const favicon = require('express-favicon');
 

const app = express();

//favicon
app.use('/favicon.ico', express.static('public/favicon.png'));



var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/elecstore');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("connected");
});


//Session Store

let mongoStore = new MongoDbStore({
    mongooseConnection : db,
    collection : "sessions"
})

//Event Emitter

const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)


app.use(session({

    secret : process.env.COOKIE_SECRET,
    resave : false,
    store : mongoStore,
    saveUninitialized : false,
    cookie : {maxAge : 1000 * 60 * 60 * 24} //24 Hours
}))

//Passport config

const passportInit = require("./app/config/passport")
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

    
//Assets
app.use(express.static("public"));
app.use(flash())
app.use(express.json())
app.use(express.urlencoded({extended : false}))

//Global Middleware for session to be available everywhere

app.use((req , res , next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()  //without next() http request will not complete
})


const PORT = process.env.PORT || 3000 ;






//set Template engine

app.use(expressLayout)
app.set('views',path.join(__dirname, '/resources/views'));
app.set('view engine','ejs');

//Routes
require('./routes/web')(app);
app.use((req,res)=>{
    res.status(404).render('errors/404')
})

const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)

})


//Socket

const io = require("socket.io")(server);

io.on('connection' ,(socket) =>{
    //join
    console.log(socket.id);
    socket.on('join',(orderId)=>{
        socket.join(orderId)
    })
})


eventEmitter.on('orderUpdated',(data)=>{

    io.to(`order_${data.id}`).emit('orderUpdated' , data)
})

eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced' , data)
})