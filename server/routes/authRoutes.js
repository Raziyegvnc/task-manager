const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User.js");

router.post('/register', async (req, res) =>{
    try {
        const { name, email, password } = req.body;
        if(!name || !email || !password){
           return res.status(400).json({ message: "Lütfen tüm alanları doldurun" });
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
           return res.status(400).json({ message: "Bu e-posta adresi zaten kullanımda" }); 
        }else{
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            const newUser = new User({ name, email, password:hashPassword });
            await newUser.save();

            const userObject = newUser.toObject();
            delete userObject.password;

            return res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu", user: userObject });
        }
       

    } catch (error) {
       res.status(500).json({ message: "Sunucu hatası", error: error.message})}
})

router.post('/login', async (req, res) =>{
    try {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ message: "Lütfen tüm alanları doldurun" });
        }else{
            const user = await User.findOne({ email });
            if (!user) {
            return res.status(400).json({ message: "Geçersiz e-posta veya şifre" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({ message: "Geçersiz e-posta veya şifre" });
            }else{
                const token = jwt.sign(
                    { id: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );
                const userObject = user.toObject();
                delete userObject.password;

                return res.status(200).json({ message: "Giriş başarılı", token: token, user: userObject });
            }
        }
    } catch (error) {
        return res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
})

 module.exports = router;