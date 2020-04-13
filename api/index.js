const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgConConfig = {
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDb,
  password: keys.pgPassword,
  port: keys.pgPort,
};
const pgClient = new Pool(pgConConfig);
pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch((err) => console.log(err));

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
  console.log('GET /');
  return res.json({ message: 'Hello There' });
});

app.get('/values/all', async (req, res) => {
  console.log('GET /values/all');
  const values = await pgClient.query('SELECT * from values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  console.log('GET /values/current');
  redisClient.hgetall('values', (err, values) => {
    if (err) {
      console.error(err);
    }

    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  console.log('POST /values');
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }
  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

const port = 5000;
app.listen(port, (err) => {
  if (err) {
    console.error(err);
  }
  console.log(`Listening on port ${port}`);
});
