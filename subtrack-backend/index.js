const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Import des routes
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications'); 
const registerRoutes = require('./routes/registerPushToken'); 
const suggestionsRoutes = require('./routes/suggestions'); 

const { checkAndNotify } = require('./scheduler');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notifications', registerRoutes);
app.use('/api/suggestions', suggestionsRoutes); 

app.get('/', (req, res) => {
  res.send('API SubTrack opérationnelle 🚀');
});

// Démarrage serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur backend opérationnel sur http://localhost:${PORT}`);
});

// Lancement automatique des notifications toutes les minutes
setInterval(() => {
  checkAndNotify();
}, 60 * 1000);