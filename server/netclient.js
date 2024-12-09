import net from 'net';
import { createWriteStream } from 'fs';

const client = net.createConnection({port:4001}, () => {
    console.log("Connected to server");
    client.write("Hello Server");
})

client.on('data', (data) => {
    console.log("Message from server", data);
    client.end();
})

const res = createWriteStream('result.txt');
const kus = createWriteStream('kus.txt');

client.pipe(kus);
client.pipe(res);

client.on('end', () => {
    console.log("Server disconnected")
})

client.on('error', (err) => {
    console.log('Error', err.message)
})

export { client }