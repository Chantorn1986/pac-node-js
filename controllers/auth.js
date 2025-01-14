const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// MySQL Connection
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

exports.login=(req,res)=>{
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
}

exports.register=(req,res)=>{
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
}