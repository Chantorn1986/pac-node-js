const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');
const multer = require('multer');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbPAC'
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

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const sql = "SELECT * FROM products";

    db.query(sql, (err, results) => {
        if (err) throw err;

        res.render('home', { 
            title: 'Home',
            products: results
        });
    })
});

app.get('/create', (req, res) => {
    res.render('create');
})

app.post('/create', upload.single('image'), (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null;

    const sql = "INSERT INTO products (name, description, image) VALUES(?, ?, ?)";
    db.query(sql, [name, description, image], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    })
})

app.get('/edit/:id', (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.render('edit', { product: result[0] });
    });
})

app.post('/edit/:id', upload.single('image'), (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : req.body.oldImage;

    const sql = "UPDATE products SET name = ?, description = ?, image = ? WHERE id = ?";
    db.query(sql, [name, description, image, req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    })
})

app.get('/delete/:id', (req, res) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
})

app.get('/about', (req, res) => {
    res.render('about', { title: 'About'});
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact'});
});

app.listen(3000, () => {
    console.log("Server is running...");
});