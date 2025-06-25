const supabase = require('./supabaseClient');
const fetch = require('node-fetch');
const moment = require('moment');

async function checkAndNotify() {
  const today = moment().startOf('day');
  const tomorrow = moment().add(1, 'days').date(); 

  const { data: abonnements, error } = await supabase
    .from('user_abonnements')
    .select('id, user_id, abonnement_id, plan_name, plan_price, payment_day')
    .eq('payment_day', tomorrow);

  if (error) {
    console.error('Erreur lors de la récupération des abonnements :', error);
    return;
  }

  for (const ab of abonnements) {
    // Vérifier si une notif a déjà été envoyée aujourd’hui pour cet abonnement
    const { data: dejaEnvoye, error: errorNotif } = await supabase
      .from('sent_notifications')
      .select('*')
      .eq('user_id', ab.user_id)
      .eq('abonnement_id', ab.id)
      .eq('date_sent', today.format('YYYY-MM-DD'));

    if (dejaEnvoye && dejaEnvoye.length > 0) {
      console.log(`⏭️ Notification déjà envoyée pour abonnement ${ab.id}`);
      continue;
    }

    // Récupérer le token push
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('expo_token')
      .eq('user_id', ab.user_id)
      .single();

    if (!tokenData?.expo_token || tokenError) {
      console.warn(`❌ Aucun token pour user ${ab.user_id}`);
      continue;
    }

    // Envoyer la notif
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: tokenData.expo_token,
        sound: 'default',
        title: '📅 Rappel abonnement',
        body: `Ton abonnement de ${ab.plan_name} se renouvelle demain`,
        data: { abonnement_id: ab.id },
      }),
    });

    // Sauvegarder l’envoi dans la table sent_notifications
    await supabase.from('sent_notifications').insert({
      user_id: ab.user_id,
      abonnement_id: ab.id,
      date_sent: today.format('YYYY-MM-DD'),
    });

    console.log(`✅ Notification envoyée pour ${ab.plan_name} à ${ab.user_id}`);
  }
}

module.exports = { checkAndNotify };