const { nextTick } = require("process");
const user = require("../../models/user");

function guest (req , res , next) {
    if(!req.isAuthenticated()){
        return next()
    }
    return res.redirect('/')
}


module.exports = guest