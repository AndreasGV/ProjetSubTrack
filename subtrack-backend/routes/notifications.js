const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const supabase = require('../supabaseClient');
require('dotenv').config();

// POST /api/notify
router.post('/notify', async (req, res) => {
  const { expoToken, title, body, data } = req.body;

  if (!expoToken || !title || !body) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: expoToken,
        sound: 'default',
        title,
        body,
        data
      })
    });

    const json = await response.json();
    res.status(200).json(json);
  } catch (err) {
    console.error('Erreur d’envoi Expo:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
