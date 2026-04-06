const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); //part c-4
const ExpressError = require("../utils/ExpressError.js"); //part c-5
const { listingSchema }=require("../schema.js");
const Listing = require("../models/listing.js");


//L8-part1c
const validateListing = (req,res,next) =>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

//INDEX ROUTE
router.get("/", wrapAsync(async(req,res) => {
    const allListings= await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//6.
//New Route  --it should be before show route  6.2
router.get("/new", (req,res)=>{
    res.render("listings/new.ejs");
});

//READ-SHOW ROUTE 6.1
router.get("/:id", wrapAsync(async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing) {
        req.flash("error","Listing you requested does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}));

//Create Route 6.3
router.post("/", validateListing, wrapAsync(async(req,res,next) =>{
    // if(!req.body.listing) {
    //     throw new ExpressError(400,"Invalid Listing Data");     //part 1c-l5 req from server
    // }
    // let result=listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error){
    //     throw new ExpressError(400,result.error);
    // }
    const newListing=new Listing(req.body.listing);
    // if(!newListing.title || !newListing.description || !newListing.price || !newListing.location || !newListing.country){
    //     throw new ExpressError(400,"Missing required Listing Data");     
    // }
    await newListing.save();
    req.flash("success","New listing Created!");
    res.redirect("/listings");    
}));

//7UPDATE

//7.1Edit route
router.get("/:id/edit",wrapAsync(async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//7.2Update route
router.put("/:id", validateListing, wrapAsync(async(req,res) =>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success","listing updated!");
    res.redirect(`/listings/${id}`);
}));

//8.Delete Route
router.delete("/:id", wrapAsync(async(req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;