
const Menu = require("../../models/menu")
function homeController () {
    return {
        index(req,res){
            Menu.find().then(function(pizzas){
                return res.render("home" , { pizzas: pizzas })
            })
            
        }
    }
}

module.exports = homeController