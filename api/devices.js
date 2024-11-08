// Description: This file contains the code to handle requests to the /api/devices endpoint.
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // MongoDB connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connectToDatabase() {
    if (!db) {
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }
        db = client.db('devices_vercel');
    }
    return db;
}

async function getNextSequenceValue(sequenceName) {
    const collection = db.collection('counters');
    const sequenceDocument = await collection.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { returnOriginal: false, upsert: true }
    );
    return sequenceDocument.value.sequence_value;
}

async function updateSequenceValue(sequenceName, newValue) {
    const collection = db.collection('counters');
    await collection.updateOne(
        { _id: sequenceName },
        { $set: { sequence_value: newValue } }
    );
}

export default async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('devices list');

        if (req.method === 'POST') {
            console.log('POST request received');
            const { name, type, status } = req.body;

            // Generate a new unique ID
            let newId;
            let isUnique = false;
            while (!isUnique) {
                newId = await getNextSequenceValue('deviceId');
                const existingDevice = await collection.findOne({ id: newId });
                if (!existingDevice) {
                    isUnique = true;
                }
            }

            // Update the new ID in the counters collection
            await updateSequenceValue('deviceId', newId);

            const newDevice = {
                id: newId,
                name,
                type,
                status
            };

            const result = await collection.insertOne(newDevice);
            console.log('Device created:', result.ops[0]);
            res.status(201).json(result.ops[0]); // Ensure status 201 is returned
        } else if (req.method === 'GET') {
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
        } else if (req.method === 'DELETE') {
            console.log('DELETE request received');
            const { id } = req.query;
            console.log(`Request to delete device ${id}`);
            const result = await collection.deleteOne({ id: parseInt(id) });
            if (result.deletedCount > 0) {
                console.log(`Device ${id} deleted`);
                res.status(200).json({ id: parseInt(id) });
            } else {
                console.log(`Device ${id} not found`);
                res.status(404).json({ error: 'Device not found' });
            }
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};