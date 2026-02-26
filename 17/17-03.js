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

        const COUNT = 10;

        await client.set('incr', 10);
        console.log("Initialized key 'incr' to 10");

        console.time('INCR');
        for (let i = 0; i < COUNT; i++) {
            await client.incr('incr');
        }
        console.timeEnd('INCR');

        console.time('DECR');
        for (let i = 0; i < COUNT; i++) {
            await client.decr('incr');
        }
        console.timeEnd('DECR');

        const finalValue = await client.get('incr');
        console.log("Final value of 'incr':", finalValue);

        await client.quit();
        console.log('Complete');

    } catch (err) {
        console.error('Error :', err);
        await client.quit();
    }
})();