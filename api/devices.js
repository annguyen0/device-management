import { promises as fs } from 'fs';
import path from 'path';
import simpleGit from 'simple-git';

const devicesFilePath = path.join(process.cwd(), 'devices.json');
const git = simpleGit();

export default async (req, res) => {
    try {
        if (req.method === 'GET') {
            console.log('GET request received');
            const data = await fs.readFile(devicesFilePath, 'utf-8');
            console.log('Data read from devices.json:', data);
            res.status(200).json(JSON.parse(data));
        } else if (req.method === 'PUT') {
            console.log('PUT request received');
            const { id } = req.query;
            const { status } = req.body;
            const data = await fs.readFile(devicesFilePath, 'utf-8');
            const devices = JSON.parse(data);
            const device = devices.find(d => d.id === parseInt(id));
            if (device) {
                device.status = status;
                await fs.writeFile(devicesFilePath, JSON.stringify(devices, null, 2));
                console.log(`Device ${id} status updated to ${status}`);

                // Commit changes to the repository
                await git.add(devicesFilePath);
                await git.commit(`Update status of device ${id} to ${status}`);
                await git.push();
                console.log('Changes committed and pushed to repository');

                res.status(200).json(device);
            } else {
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