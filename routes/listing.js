const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");

const defaultImageUrl = "https://static.vecteezy.com/system/resources/thumbnails/054/880/166/small/thriving-tree-in-lush-green-environment-nature-conservation-and-protection-concept-free-photo.jpeg";

const normalizeImage = (listing) => {
    if (!listing.image || !listing.image.url) {
        listing.image = { url: defaultImageUrl };
    } else if (listing.image.url === "") {
        listing.image.url = defaultImageUrl;
    }
};

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
        
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else {
            next();
        }
   };

//Index Route
router.get("/", wrapAsync(async(req, res) => {
   const allListings = await Listing.find({});
   res.render("listings/index.ejs", {allListings});
   }));

   //New Route
   router.get("/new",isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
   });

   //Show Route
   router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
   }));

   //Create Route
  router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    normalizeImage(req.body.listing);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the current user
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

}));
   
   //Edit Route
   router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing} );
   }));

   //Update Route
   router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    normalizeImage(req.body.listing);
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

   //Delete route
   router.delete("/:id",isLoggedIn, isOwner, wrapAsync (async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
   })
);

module.exports = router;