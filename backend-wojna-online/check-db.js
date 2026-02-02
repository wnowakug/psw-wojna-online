const db = require('./src/db');

db.get('SELECT email, password FROM users LIMIT 1', [], (err, row) => {
  console.log(row);
  db.close();
});
