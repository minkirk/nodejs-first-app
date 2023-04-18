import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


mongoose.connect("mongodb://localhost:27017",{
    dbname:"backend",

}).then(()=> console.log("Database Connected!!!"));

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
});

 const User = mongoose.model("User", userSchema);

const app = express();



app.use(express.static(path.join(path.resolve(),"public")));

//using middleware
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());


app.set("viewEngine","ejs");

const isAuthenticated = (req,res,next)=>{
    const {token} = req.cookies;
    if(token)
    {
        const decoded = jwt.verify(token,"asdewegrhhrhthtf");
        req.user =  User.findById(decoded._id);
        next();
    }else{
        res.redirect("/login.ejs");
    }
}


app.get("/",isAuthenticated,(req,res)=>{
    console.log(req.user);
    res.render("logout.ejs",{name:req.user.name});
});


app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

app.get("/",(req,res)=>{
   
   const {token} = req.cookies;

   if(token)
   {
    res.render("logout.ejs");

   }
   else{
    res.render("login.ejs");
   }

    

});

app.get("/register",(req,res)=>{
    res.render("register.ejs");
});

app.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    let user = await User.findOne({email});
    if(!(user)) return res.redirect("/register.ejs");

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch) return res.render("login",{message:"incorrect password"});

    const token = jwt.sign({_id:user._id},"asdewegrhhrhthtf");
    

    res.cookie("token",token,{
        httpOnly:true,expires:new Date(Date.now()+60*1000)
    });
    res.redirect("/");

});


app.post("/register",async (req,res)=>{

    console.log(req.body);

    const{name,email,password} = req.body;

    let user = await User.findOne({email});
    if(user){
        return res.redirect("/login");

    }

    const hashedPassword = await bcrypt.hash(password,10);



     user = await User.create({
        name,
        email,
        password:hashedPassword

    });
    
    const token = jwt.sign({_id:user._id},"asdewegrhhrhthtf");
    

    res.cookie("token",token,{
        httpOnly:true,expires:new Date(Date.now()+60*1000)
    });
    res.redirect("/");
    
});


app.get("/logout",(req,res)=>{
    res.cookie("token","",{
        httpOnly:true,
        expires:new Date(Date.now())
    });
    res.redirect("/");
    
});





 
//  //sending data to db
// app.get("/add",async (req,res)=>{

//     await Message.create({name:"sam",email:"manekshaw@gmail.com"})
//     .then(()=>{
//     res.send("nice!!!");
        
//     });
// });
 


//adding data to db from a formf
// app.post("/contact",async (req,res)=>{
   
//     //destructuring the variable
//     const{name,email} = req.body;

//     await Message.create({
//         name:name,
//         email:email
//     });

//     res.redirect("/success");
// });

app.listen(5000,()=>{
    console.log("server is Up!!!");
});