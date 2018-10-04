
var express = require('express');
const {Pool,Client} = require('pg');
var pug=require('pug');
var bcrypt = require('bcryptjs');

var bodyParser = require('body-parser');
var PORT = 8080;

var User = require('./modules/User');
var session = require('express-session')



//app
var app = express();
app.set('view engine','pug');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({
  resave: false,
  saveUninitialized: true,
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));


app.get('/',function(req,res){
    res.render('index',{title:'Home'});
});

app.get('/me',function(req,res){

	if(req.session._id)
	{
		res.render('me',{
			username:User.userData.username
		});
	}
	else
		res.redirect('/login');

	
});

app.get('/login',function(req,res){
	res.render('login',{title:'Login'});
});

app.post('/login',function(req,res){
	var client = User.client;
	var username=req.body.username;
	var password=req.body.password;
	if(username && password){
		var userDetailString = "Select * from credential c,users u where c.uid="+username+" and c.password='"+password+"' and c.uid=u.uid;";
		var query ={
			name:'fetch-creds',
			text:userDetailString,
			values:[]
		};
		client.query(userDetailString,(err,resp)=>{
			if(err || resp.rowCount==0)
			{
				res.render('error',{
								title:'Error',
								error:"Check login details.."
							});
			}
			else{

				User.userData.username=username;
				User.userData.fullname=resp.rows[0].uid;
				User.userData.password=password;
				User.userData.email=resp.rows[0].email;


				req.session._id=username;
				res.redirect('/me');

			}
		});
	}
});


app.get('/register',function(req,res){
	res.render('register',{title:'Register'});
});

app.get('/credential.json',function(req,res){
	var client = User.client;
	client.query('Select * from credential',(err,resp)=>{
		if(err)
			res.send(err);
		else
			res.send(resp.rows)
	});
});

app.post('/register',function(req,res){
	if(req.body.username && req.body.password && req.body.email){

		var status;
		var username = req.body.username;
		var name = req.body.fullname;
		var email=req.body.email;
		var password=req.body.password;
		
		User.userData.username=username;
		User.userData.fullname=name;
		User.userData.password=password;
		User.userData.email=email;

		//password = bcrypt.hashSync(password);
		var userString = "Insert into users(uid,name) values("+username+",'"+name+"');";
		var queryUser = {
			name:'add-user',
	        text:userString,
	        values:[],
		};


		var client = User.client;

		client.query(queryUser,(err2,res2)=>{
			if(err2)
			{
				console.log(err2);
				status = {status:'error',data:err2};
				res.render('error',{
								title:'Error',
								error:err2
							});
			}
			else{
				console.log("Added to user..");
				var credString = "Insert into credential(uid,email,password) values("+username+",'"+email+"','"+ password +"');";
				var queryCred = {
					name:'add-cred',
			        text:credString,
			        values:[],
				};
				client.query(queryCred,(err1,res1)=>{
					if(err1)
					{
							console.log(err1);
							status={status:'error',data:err1};
							res.render('error',{
								title:'Error',
								error:err1
							});
							
					}
					else{
							console.log("Successful");
							status = {status:'okay',data:'User has been added..'};
							
							res.send(status);
						
					}

				});

			}
		});



	}
	else{
		res.render('error',{title:'Error',error:"Username,password and Email is required."});
	}
});


app.listen(PORT);