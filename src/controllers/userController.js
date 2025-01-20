const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config()


const { JWT_SECRET } = process.env

const generateToken = async (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' })
}

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: 'Semua field harus diisi' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email sudah digunakan' });

    const user = await User.create({ name, email, password });
    const token = await generateToken(user.id)
    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token
        });
    } else {
        res.status(400).json({ message: 'Gagal membuat user' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const token = await generateToken(user.id)
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token
        });
    } else {
        res.status(401).json({ message: 'Email atau password salah' });
    }
};

module.exports = { registerUser, loginUser };