const express = require('express');
const cors = require('cors');
const http = require('http');
const initGameMQTT = require('./mqtt/game');
const { Server } = require('socket.io');

// Trasy REST API
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');

const app = express();
const PORT = 4000;

// Pozwalamy frontendowi łączyć się z backendem z innego originu
app.use(cors());

// Automatyczne parsowanie JSON w requestach
app.use(express.json());

// Sekret używany do podpisywania i weryfikacji JWT
app.set('jwt-secret', 'super_tajny_klucz');

// Rejestracja endpointów REST
app.use('/users', usersRoutes);   // rejestracja użytkowników
app.use('/auth', authRoutes);     // logowanie i profil
app.use('/games', gamesRoutes);   // tworzenie i dołączanie do gier

// Tworzymy serwer HTTP na bazie Express
const server = http.createServer(app);

// Inicjalizacja Socket.IO (WebSocket) na tym samym serwerze
const io = new Server(server, {
  cors: { origin: '*' } // pozwalamy frontendowi na połączenie
});

// Udostępniamy instancję socket.io w całej aplikacji (np. w trasach)
app.set('io', io);

// Logika lobby i czatu (pokoje gier, komunikaty systemowe)
const initLobby = require('./socket/lobby');
initLobby(io);

// Uruchomienie obsługi logiki gry przez MQTT (rundy, karty, punkty)
initGameMQTT();

// Start serwera backendowego
server.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});
