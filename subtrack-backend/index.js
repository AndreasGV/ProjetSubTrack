const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications'); 
const registerRoutes = require('./routes/registerPushToken'); 
const { checkAndNotify } = require('./scheduler');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notifications', registerRoutes);

app.get('/', (req, res) => {
  res.send('API SubTrack opérationnelle 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur backend opérationnel sur http://localhost:${PORT}`);
});

// Lancement automatique du système de notifications toutes les minutes
setInterval(() => {
  checkAndNotify();
}, 60 * 1000); // toutes les minutes