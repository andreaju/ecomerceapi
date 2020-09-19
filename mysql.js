const mysql = require('mysql')

var pool  = mysql.createPool({
    "user" : "sysdba",
    "password" : "masterkey",
    "database" : "ecomerce",
    "host" : "localhost",
    "port" : 3306}
)


exports.pool = pool;
