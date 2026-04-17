const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema ({
    // title: {
    //     type: String,
    //     required: true,
    // },
    title: String,
    description: String,
    image: {
        type: String,
        default: "https://www.pexels.com/search/sunset%20tree/",
        set: (v) => 
            v === "" 
              ? "https://www.pexels.com/search/sunset%20tree/" 
                : v,
    },
    // image: {
    //     filename: String,
    //     url: String,
    // },
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;