import { promises as fs } from 'fs';
import path from 'path';

const devicesFilePath = path.join(process.cwd(), 'devices.json');

export default async (req, res) => {
    if (req.method === 'GET') {
        const data = await fs.readFile(devicesFilePath, 'utf-8');
        res.status(200).json(JSON.parse(data));
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        const { status } = req.body;
        const data = await fs.readFile(devicesFilePath, 'utf-8');
        const devices = JSON.parse(data);
        const device = devices.find(d => d.id === parseInt(id));
        if (device) {
            device.status = status;
            await fs.writeFile(devicesFilePath, JSON.stringify(devices, null, 2));
            res.status(200).json(device);
        } else {
            res.status(404).json({ error: 'Device not found' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};