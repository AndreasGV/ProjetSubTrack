const express = require('express');
const router = express.Router();
console.log('📥 Reçu token à enregistrer :', { user_id, token });
const supabase = require('../supabaseClient');
require('dotenv').config();

// POST /api/notifications/register
router.post('/register', async (req, res) => {
  const { user_id, token } = req.body;

  if (!user_id || !token) {
    return res.status(400).json({ error: 'user_id et token sont requis.' });
  }

  const { error } = await supabase
    .from('user_tokens')
    .upsert({ user_id, expo_token: token }, { onConflict: ['user_id'] });

  if (error) {
    console.error('Erreur d’enregistrement du token :', error);
    return res.status(500).json({ error: 'Erreur d’enregistrement du token' });
  }

  res.status(200).json({ message: 'Token enregistré avec succès' });
});

module.exports = router;