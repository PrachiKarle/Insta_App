var express=require('express');
const app=express();

app.use(express.static('public/'));
app.use(express.urlencoded({extended:true}));

var exe=require('./connection');

var sendOTP=require('./Email'); 


// session
var session=require('express-session');
app.use(session(
    {
        resave:true,
        saveUninitialized:true,
        secret:"prachi"
    }
))


//signup page
app.get('/signup',(req,res)=>{
    res.render('signup.ejs');
})

//insert
app.post('/saveuser',async(req,res)=>{
    const {user_email,user_pass,user_fullnm,user_name}=req.body;

    var sql=`insert into instagram(user_email,user_pass,user_fullnm,user_name) values('${user_email}','${user_pass}','${user_fullnm}','${user_name}')`;

    await exe(sql);
    res.redirect('/');
})


//login page
app.get('/',(req,res)=>{
    res.render('home.ejs');
})




//loginuser
app.post('/loginuser',async(req,res)=>{
    const {user_name,user_pass}=req.body;

    var sql=`select* from instagram where (user_email='${user_name}' OR user_name='${user_name}') AND user_pass='${user_pass}'`;

    var data=await exe(sql);
    // res.send(data);
    
    if(data.length>0){

        req.session.login_id=data[0].insta_id;

        var otp=Math.trunc(Math.random()* 10000);
        req.session.otp=otp;
       
        sendOTP(data[0].user_email,otp,data[0].user_fullnm);
        res.redirect('/accept_otp');
    }
    else{
       res.send(`
         
        <script>
            alert('Sorry, Please Enter valid login information');
            location.href='/';
        </script>
        
        `)
    }
})



//accept otp page
app.get('/accept_otp',(req,res)=>{
    if(req.session.login_id){
        res.render('otp.ejs'); 
    }
    else{
        res.redirect('/');
    }
   
})



//verify otp
app.post('/verify_otp',(req,res)=>{
    if(req.session.otp==req.body.otp)
    {
        req.session.insta_id=req.session.login_id;
        res.redirect('/profile');
    }
    else{
          res.send(`
              <script> 
                  alert('Sorry, Please enter correct OTP');
                  location.href='/';
              </script>
            `)
    }
})



//profile page
app.get('/profile',async(req,res)=>{
    // if(req.session.insta_id){
        var sql=`select* from instagram where insta_id='${req.session.insta_id}'`;
        var data=await exe(sql);
        const obj={data:data[0]};
        res.render('profile.ejs',obj);
    // }
    // else{
    //     res.redirect('/');
    // }
})




// update
app.get('/edit_profile',async(req,res)=>{
    if(req.session.insta_id){
        var sql=`select* from instagram where insta_id='${req.session.insta_id}'`;
        var data=await exe(sql);
        const obj={data:data[0]};
        res.render('editprofile.ejs',obj);
    }
    else{
        res.redirect('/');
    }
})

app.post('/updateuser',async(req,res)=>{
    // res.send(req.body);
    if(req.session.insta_id){
        const {user_fullnm,user_name,user_email,user_pass}=req.body;
        var sql=`update instagram set user_fullnm='${user_fullnm}', user_name='${user_name}', user_email='${user_email}', user_pass='${user_pass}' where insta_id='${req.session.insta_id}'`;
        await exe(sql);
        res.redirect('/profile');
    }
    else{
        res.redirect('/');
    }
})



// delete 
app.get('/delete_profile',async(req,res)=>{
    if(req.session.insta_id){
        var sql=`delete from instagram where insta_id='${req.session.insta_id}'`;
        await exe(sql);
        res.redirect('/signup');
    }
    else{
        res.redirect('/');
    }
})



//server start
const PORT=3000 || process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})




// create table instagram(insta_id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
//     user_email varchar(100),
//     user_pass varchar(8),
//     user_fullnm varchar(100),
//     user_name varchar(100)
// )
