import { NextResponse } from "next/server";
import axios from 'axios';
import { createClient } from 'redis';
const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});
client.on('error', err => console.log('Redis Client Error', err));
await client.connect();
// client connected
export async function GET() {
    const cachedValue = await client.get('comments');
    if (cachedValue) {
        return NextResponse.json({ "method": "GET", "status": 200, "comments": JSON.parse(cachedValue) });
    }
    const { data } = await axios.get('https://jsonplaceholder.typicode.com/comments');
    await client.set('comments', JSON.stringify(data));
    client.expire('comments', 60); // comments will expire within this 1 min
    return NextResponse.json({ "method": "GET", "status": 200, "result": data });
}