import mysql from 'mysql';

const connectMySql = mysql.createPool({
    host:'sql12.freesqldatabase.com',
    user:'sql12619797',
    password:'WNPpAHeR2z',
    database:'sql12619797'
});

connectMySql.getConnection((err, conn) =>{
    if(err) console.log('MySql Connection Error');
    console.log('MySql Database connected', conn.config.host, conn.config.database);
});

// let sqlConnect = connectMySql.on('connection', (stream) => {
//     console.log('MySql Database connected 2222', stream.config.database, stream.config.host);
//   });

export default connectMySql;