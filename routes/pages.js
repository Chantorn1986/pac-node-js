const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');

const { login,register } = require("../controllers/auth");

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage });

router.get('/viwe', (req, res) => {
    const sql = "SELECT * FROM products";

    db.query(sql, (err, results) => {
        if (err) throw err;

        res.render('home', { 
            title: 'Home',
            products: results
        });
    })
});

router.get('/create', (req, res) => {
    res.render('create');
})

router.post('/create', upload.single('image'), (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null;

    const sql = "INSERT INTO products (name, description, image) VALUES(?, ?, ?)";
    db.query(sql, [name, description, image], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    })
})

router.get('/edit/:id', (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.render('edit', { product: result[0] });
    });
})

router.post('/edit/:id', upload.single('image'), (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : req.body.oldImage;

    const sql = "UPDATE products SET name = ?, description = ?, image = ? WHERE id = ?";
    db.query(sql, [name, description, image, req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    })
})

router.get('/delete/:id', (req, res) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
})

router.get('/about', (req, res) => {
    res.render('about', { title: 'About'});
});

router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact'});
});

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
router.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
})

router.get('/login', ifLoggedIn, (req, res) => {
    res.render('login');
})

router.get('/register', ifLoggedIn, (req, res) => {
    res.render('register');
})

router.get('/home', isAuthenticated, (req, res) => {
    console.log(req.session.user);
    res.render('home', { user: req.session.user });
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

router.post('/register',(req,res)=>{
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

router.post('/login',(req,res)=>{
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

module.exports =  router;