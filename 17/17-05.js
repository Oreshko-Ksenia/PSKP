const redis = require('redis');

const subscriber = redis.createClient({
    url: 'redis://default:70drCfNWb1bK8bePOFL5VhbjvpFQ5DXe@redis-15136.c114.us-east-1-4.ec2.redns.redis-cloud.com:15136'
});

const publisher = redis.createClient({
    url: 'redis://default:70drCfNWb1bK8bePOFL5VhbjvpFQ5DXe@redis-15136.c114.us-east-1-4.ec2.redns.redis-cloud.com:15136'
});

(async () => {
    await subscriber.connect();
    console.log('Subscriber connected');

    await subscriber.subscribe('channel', (message) => {
        console.log(`[Subscriber] Получено сообщение: ${message}`);
    });
    console.log('Subscriber подписан на канал');
})();

(async () => {
    await publisher.connect();
    console.log('Publisher connected');

    let counter = 1;
    setInterval(async () => {
        const message = `Строка ${counter++}`;
        console.log(`[Publisher] Отправка: ${message}`);
        await publisher.publish('channel', message);
    }, 2000);
})();