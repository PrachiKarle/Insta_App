var mysql=require('mysql');
var util=require('util');

var conn=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'backendmodule',
    port:'3306'
})

conn.connect((err)=>{
    console.log(err);
})

var exe=util.promisify(conn.query).bind(conn);

module.exports=exe;