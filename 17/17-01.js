const redis = require('redis');

const client = redis.createClient({
  url: 'redis://default:70drCfNWb1bK8bePOFL5VhbjvpFQ5DXe@redis-15136.c114.us-east-1-4.ec2.redns.redis-cloud.com:15136'
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Connect'));

async function run() {
  await client.connect();
  await client.set('key', 'value');
  const value = await client.get('key');
  console.log('Value:', value);
  await client.quit();
}

run().catch(console.error);