const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const folder = path.join(__dirname, '..', '..', 'db');
fs.mkdirSync(folder, {
  recursive: true
});

const VERSION = 1;
const db = new sqlite3(path.join(folder, `cloud-server-${VERSION}.db`))
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS variables (
  id TEXT PRIMARY KEY NOT NULL,
  data TEXT NOT NULL
);
`);

const getStatement = db.prepare('SELECT data FROM variables WHERE id=?;');
const setStatement = db.prepare('INSERT OR REPLACE INTO variables (id, data) VALUES (?, ?);');

const getVariables = (id) => {
  const data = getStatement.get(id);
  if (data) {
    return JSON.parse(data.data);
  }
  return null;
};

const setVariables = (id, variables) => {
  setStatement.run(id, JSON.stringify(variables));
};

module.exports = {
  getVariables,
  setVariables
};
