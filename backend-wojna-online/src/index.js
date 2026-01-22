const express = require('express');
const cors = require('cors');

const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');


const app = express();
const PORT = 4000;

const JWT_SECRET = 'NiktNigdyNieOdgadnieTegoKlucza';
app.set('jwt-secret', JWT_SECRET);

app.use(cors());
app.use(express.json());

app.use('/users', usersRoutes);
app.use('/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('Backend działa');
});

const http = require('http');
const initChat = require('./ws/chat');

const server = http.createServer(app);
initChat(server, app);

server.listen(PORT, () => {
  console.log(`Server działa na porcie ${PORT}`);
});
