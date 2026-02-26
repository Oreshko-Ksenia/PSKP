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

        console.time('SET');
        for (let i = 1; i <= COUNT; i++) {
            await client.set(i.toString(), `set${i}`);
        }
        console.timeEnd('SET');

        console.time('GET');
        for (let i = 1; i <= COUNT; i++) {
            const value = await client.get(i.toString());
        }
        console.timeEnd('GET');

        console.time('DEL');
        for (let i = 1; i <= COUNT; i++) {
            await client.del(i.toString());
        }
        console.timeEnd('DEL');

        await client.quit();
        console.log('Complete');

    } catch (err) {
        console.error('Error: ', err);
        await client.quit();
    }
})();