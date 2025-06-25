const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET /api/suggestions/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  // Récupérer les abonnements de l'utilisateur
  const { data: userSubs, error: userSubsError } = await supabase
    .from('abonnements_utilisateurs')
    .select('abonnement_id')
    .eq('user_id', userId);

  if (userSubsError) {
    return res.status(500).json({ error: 'Erreur abonnements utilisateurs' });
  }

  const ownedIds = userSubs.map((s) => s.abonnement_id);

  // Récupérer les suggestions (10 max) en excluant ceux déjà possédés
  const { data: suggestions, error: suggestionsError } = await supabase
    .from('abonnements')
    .select('*')
    .not('id', 'in', `(${ownedIds.join(',')})`)
    .limit(10);

  if (suggestionsError) {
    return res.status(500).json({ error: 'Erreur récupération suggestions' });
  }

  return res.json(suggestions);
});

module.exports = router;