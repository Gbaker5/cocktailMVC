const express = require('express')
const app = express()
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const connectDB = require('./config/database')
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const morgan = require('morgan')

const homeRoutes = require('./routes/home')
const searchRoutes = require('./routes/search')
const listRoutes = require('./routes/lists')
//const favoriteRoutes = require('./routes/favorites')


require('dotenv').config({path: './config/.env'})

// Passport config
require("./config/passport")(passport);


connectDB()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Setup Sessions - stored in MongoDB
app.use(
    session({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.DB_STRING,  // or your connection string
        mongooseConnection: mongoose.connection, // optional in v4+
      }),
      cookie: {
      secure: false,     // 🔴 MUST be false on localhost
      httpOnly: true,
      sameSite: "lax",   // ✅ important for Chrome
      },
    })
  );

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

app.use(methodOverride('_method'))
app.use(morgan('dev'))


app.use('/', homeRoutes)
app.use('/search', searchRoutes)
app.use('/lists', listRoutes)
//app.use('/favorites', favoriteRoutes)
 
app.listen(process.env.PORT, ()=>{
    console.log('Server is running, you better catch it!')
})    