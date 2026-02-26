const redis = require('redis');

const client = redis.createClient({
    url: 'redis://default:70drCfNWb1bK8bePOFL5VhbjvpFQ5DXe@redis-15136.c114.us-east-1-4.ec2.redns.redis-cloud.com:15136'
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Connect'));

(async () => {
    try {
        await client.connect();
        console.log('Start');
        await client.flushDb();

        const COUNT = 10;

        console.time('HSET');
        for (let i = 1; i <= COUNT; i++) {
            await client.hSet(i.toString(), 'id', i);
            await client.hSet(i.toString(), 'val', `val-${i}`);
        }
        console.timeEnd('HSET');

        console.time('HGET');
        for (let i = 1; i <= COUNT; i++) {
            const id = await client.hGet(i.toString(), 'id');
            const val = await client.hGet(i.toString(), 'val');
        }
        console.timeEnd('HGET');

        await client.quit();
        console.log('Complete');

    } catch (err) {
        console.error('Error :', err);
        await client.quit();
    }
})();