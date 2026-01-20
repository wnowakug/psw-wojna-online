const express = require('express');
const cors = require('cors');

const usersRoutes = require('./routes/users');

const app = express();
const PORT = 4000;

// ⬇️ MIDDLEWARE MUSI BYĆ PRZED ROUTES
app.use(cors());
app.use(express.json());

// ⬇️ ROUTES DOPIERO POTEM
app.use('/users', usersRoutes);

app.get('/', (req, res) => {
  res.send('Backend działa');
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
