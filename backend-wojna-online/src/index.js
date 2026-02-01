const express = require('express');
const cors = require('cors');
const http = require('http');
const initGameMQTT = require('./mqtt/game');


const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');


const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.set('jwt-secret', 'super_tajny_klucz');

app.use('/users', usersRoutes);
app.use('/auth', authRoutes);
app.use('/games', gamesRoutes);

const server = http.createServer(app);

initGameMQTT();

server.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});