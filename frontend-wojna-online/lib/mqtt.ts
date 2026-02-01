import mqtt from 'mqtt';

const client = mqtt.connect('ws://localhost:9001');

client.on('connect', () => {
  console.log('MQTT connected (frontend)');
});

client.on('error', (err) => {
  console.error('MQTT error', err);
});

export default client;
