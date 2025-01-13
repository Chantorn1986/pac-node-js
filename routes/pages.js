const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

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

router.get('/', (req, res) => {
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

module.exports =  router;