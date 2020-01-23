const keys = require("./keys");
const redis = require("redis");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Express
app.use(cors());
app.use(bodyParser.json());


// Postgres
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  port: keys.pgPort,
  database: keys.pgDatabase,
  password: keys.pgPassword
});

pgClient
  .on("error", () => console.log("Lost PG connection"));
pgClient
  .query("CREATE TABLE IF NOT EXISTS values (number INT)")
  .catch(err => console.log(err));


// Redis
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();
app.get("/", (req, res) => res.send("hi"));
app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * FROM values");
  res.send(values.rows);
});
app.get("/values/current", async (req, res) => redisClient.hgetall("values", (err, values) => res.send(values)));
app.post("/values", async (req, res) => {
  const index = req.body.index;
  if(parseInt(index) > 40)
    return res.status(422).send("Index to high");

  redisClient.hset("values", index, "Nothing Yet");
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);
  res.send({working: true});
});


app.listen(5000, app => {
  console.log("App listening");
});