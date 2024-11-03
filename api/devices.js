// Description: This file contains the code to handle requests to the /api/devices endpoint.
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // MongoDB connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
    }
    return client.db('devices_vercel').collection('devices list');
}

export default async (req, res) => {
    try {
        const collection = await connectToDatabase();

        if (req.method === 'GET') {
            console.log('GET request received');
            const devices = await collection.find({}).toArray();
            console.log('Devices fetched from database:', devices);
            res.status(200).json(devices);
        } else if (req.method === 'PUT') {
            console.log('PUT request received');
            const { id } = req.query;
            const { status } = req.body;
            console.log(`Request to update device ${id} with status ${status}`);
            const result = await collection.updateOne({ id: parseInt(id) }, { $set: { status: status } });
            if (result.matchedCount > 0) {
                console.log(`Device ${id} status updated to ${status}`);
                res.status(200).json({ id: parseInt(id), status: status });
            } else {
                console.log(`Device ${id} not found`);
                res.status(404).json({ error: 'Device not found' });
            }
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};