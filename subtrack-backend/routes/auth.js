// 📁 subtrack-backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const users = [];

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const userExists = users.find(u => u.email === email);
  if (userExists) return res.status(400).json({ message: 'Utilisateur déjà existant' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });

  res.status(201).json({ message: 'Utilisateur créé' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Utilisateur inconnu' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

  const token = jwt.sign({ email }, process.env.JWT_SECRET || 'SECRET123', { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;