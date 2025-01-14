const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
//const multer = require('multer');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbpac'
})

/*const db = mysql.createConnection({
    host: 'localhost',
    user: 'premier_sa',
    password: 'Premier@021812299',
    database: 'pac_system'
})
*/

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }

    console.log('Connected to MySQL database successfully.');
})
/*
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage });
*/

// Setup middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    secret: 'nodesecret',
    resave: false,
    saveUninitialized: true
}))

app.set('view engine', 'ejs');


app.use('/',require('./routes/pages'));

app.listen(3000, () => {
    console.log("Server is running...");
});