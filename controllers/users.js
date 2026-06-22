const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.signup = async(req, res, next) => {
    try {
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to WanderNest!");
            res.redirect("/listings");
        });
        
    } catch(e){
      req.flash("error", e.message);
      res.redirect("/signup");
    }
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to WanderNest!");
    res.redirect(res.locals.redirectUrl || "/listings");

};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((sessionErr) => {
            if (sessionErr) {
                return next(sessionErr);
            }
            res.clearCookie("connect.sid");
            res.redirect("/listings");
        });
    });
};