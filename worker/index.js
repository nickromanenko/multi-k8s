const keys = require('./keys');
const redis = require('redis');
const options = {
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
};
const redisClient = redis.createClient(options);
const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
  console.log('on message', message, fib(parseInt(message)));
  redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');
