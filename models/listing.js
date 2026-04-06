const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

//1.defining schema
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://unsplash.com/photos/sunset-over-a-rocky-beach-with-calm-waves-hL4JNNkWiwI",
        set: (v) => v === "" ? "https://unsplash.com/photos/sunset-over-a-rocky-beach-with-calm-waves-hL4JNNkWiwI" : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

listingSchema.post("findOneAndDelete", async (listing) =>{
    if(listing) {
      await Review.deleteMany({ _id: { $in: listing.reviews }})   
    } 
});



//2.creating model
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;