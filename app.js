const express = require("express");
const app = express();
const cors = require("cors"); //
app.use(cors());              //
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");    //part b-1
const ExpressError = require("./utils/ExpressError.js"); //part c-5
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//5.
app.set("view engine", "ejs"); //5.2
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);   //part b-2
app.use(express.static(path.join(__dirname, "public"))); //part b-3 :to use static files like css,js,image

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.get("/", (req, res) =>{//5.1
    res.send("Hi, I  am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// app.get("/demouser", async(req, res) =>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//3.
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";             //3.2 mongoose.js--> copy link and changen database name test to wanderlust

main().then( () => {                 // 3.3 calls main function
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

async function main(){    //3.1
    await mongoose.connect(MONGO_URL);    //for database
};

/*app.all(*) is not working so using regex to match all routes*/
app.all(/.*/,(req,res,next)=>{
     next(new ExpressError(404,"Page not found"));
 });

//10.custome expresserror part1c-l5
app.use((err,req,res,next)=>{
    const {statusCode=500,message="Something went wrong"}=err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
});

//1.
const PORT = process.env.PORT || 3000;  /*new*/
app.listen(8080, () =>{
    console.log("server is listening on port 8080");
});