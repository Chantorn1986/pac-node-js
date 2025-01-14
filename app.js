const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs');

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage });

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


//app.use('/',require('./routes/pages'));
// Check LoggedIn
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function ifLoggedIn(req, res, next) {
    if (req.session.user) {
        return res.redirect('/home');
    }
    next();
}

// GET Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
})

app.get('/login', ifLoggedIn, (req, res) => {
    res.render('login');
})

app.get('/register', ifLoggedIn, (req, res) => {
    res.render('register');
})

app.get('/home', isAuthenticated, (req, res) => {
    console.log(req.session.user);
    res.render('home', { user: req.session.user });
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

app.post('/register',(req,res)=>{
        const { name, email, password,confirmpassword } = req.body;

        const checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
        db.query(checkEmailQuery, [email], (err, result) => {
            if (err) throw err;
    
            if (result.length > 0) {
                // Check if email already exists
                return res.render('Register',{ 
                    success: false,
                    error_msg: "Email ลงทะเบียนซ้ำกรุณาตรวจสอบ" });
                //res.render('register', { error_msg: 'Email already registered. Please use a different email.'})
            }else if(password !== confirmpassword){
                return res.render('Register',{ 
                    success: false,
                    error_msg: "รหัสยืนยันไม่ตรงกัน กรุณาตรวจสอบ" });
            } else {
                const hashedPassword =bcrypt.hashSync(password, 10);
                
                const insertUserQuery = 'INSERT INTO user (name, email, password) VALUES(?, ?, ?)';
                db.query(insertUserQuery, [name, email, hashedPassword], (err, result) => {
                    if (err) throw err;
                    return res.render('Register',{ 
                        success: true,
                        success_msg: "Email ลงทะเบียบเรียบร้อย" });
                    //res.render('register', { success_msg: 'Registration successfully!'})
                })
            }
        });
});

app.post('/login',(req,res)=>{
        const { email, password } = req.body;
    
        const sql = 'SELECT * FROM user WHERE email = ?';
        db.query(sql, [email], (err, result) => {
            if (err) throw err;
    
            if (result.length > 0) {
                const user = result[0];
                if (bcrypt.compareSync(password, user.password)) {
                    req.session.user = user;
                    //res.redirect('/home');

                    const sql = "SELECT * FROM products";
                    
                    db.query(sql, (err, results) => {
                        if (err) throw err;
                        
                        res.render('home', { 
                            title: 'Home',
                            products: results,
                            user : user
                        });
                    })
                } else {
                    return res.render('login',{ 
                        success: false,
                        error_msg: "Password ไม่ถูกต้อง!!" }); 
                }
            } else {
                return res.render('login',{ 
                    success: false,
                    error_msg: "Email ไม่ถูกต้องกรุณากรอก email ใหม่ !!!" });
            }
        })
});

app.listen(3000, () => {
    console.log("Server is running...");
});