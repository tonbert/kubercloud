const keys = require('./keys');
const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const sub = redisClient.duplicate();

function tomfib(index) {
  if(index < 2)
    return 1;
  return tomfib(index - 1) + tomfib(index - 2);
}


sub.on("message", (channel, message) => {
  redisClient.hset("values", message, tomfib(parseInt(message)));
});

sub.subscribe("insert");