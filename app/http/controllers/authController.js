const User = require('../../models/user')
const bcrypt = require("bcrypt")
const passport = require('passport')
const { nextTick } = require('process')
function authController () {
    const _getRedirectUrl =(req) => {
        return  req.user.role ==='admin' ? '/admin/orders' : '/customer/orders'
    }
    return {

        login(req,res){
            res.render("./auth/login")
        },

        postLogin(req , res , next){
            const {email, password} = req.body
            //Validate Form
            if(!email || !password){
                req.flash('error','All fields are required')
                return res.redirect('/login')
            }
            passport.authenticate('local',(err , user , info)=>{
                if(err){
                    req.flash('error',info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error' , info.message)
                    return res.redirect('/login')
                }
                req.logIn(user ,(err)=>{
                    if(err){
                        req.flash('error' , info.message)
                        return next(err)
                    }
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req , res , next)
        },

        register(req,res){
            res.render("./auth/register")
        },
        async postRegister(req,res){
            const {name , email, password} = req.body
            //Validate Form
            if(!name || !email || !password){
                req.flash('error','All fields are required')
                req.flash('name',name)
                req.flash('email',email)
                res.redirect('/register')
            }

            //Email exists or not

            User.exists({email : email},(err , result)=>{
                if(result){
                    req.flash('error','Email is already taken')
                    req.flash('name',name)
                    req.flash('email',email)
                    res.redirect('/register')
                }
                
            })

            //Hashing password
            
            const hashPassword = await bcrypt.hash(password,10)

            //creating new user
            const user = new User({
                name : name ,
                email : email ,
                password : hashPassword
            })
            
            user.save().then((user)=>{
                //login
                res.redirect('/')
            }).catch(err=>{
                req.flash('error','Something went wrong')
                    
                    res.redirect('/')
            })
        },

        logout(req,res){
            req.logout()
            return res.redirect('/login')
        }

    }
}

module.exports = authController