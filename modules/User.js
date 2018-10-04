const {Pool,Client} = require('pg');
const client = new Client({
    user: 'zbqefnsgabuhih',
    host: 'ec2-50-17-194-186.compute-1.amazonaws.com',
    database: 'dc1hv1tahfllru',
    password: '705349e3f0caec6f09669c0392ac55b8ee564c360d74ac7a1096f70f2056482b',
    port: 5432,
    ssl:true,
  })

client.connect();

var userData = {
	username:null,
	password:null,
	fullname:null,
	photo:null,
	dob:null,
	email:null,
}

module.exports.client=client;
module.exports.userData=userData;