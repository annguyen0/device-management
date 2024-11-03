import { promises as fs } from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import chokidar from 'chokidar';

const devicesFilePath = path.join(process.cwd(), 'devices.json');
const git = simpleGit();

// Function to commit changes to the repository
async function commitChanges() {
    try {
        await git.add(devicesFilePath);
        await git.commit(`Update devices.json`);
        await git.push();
        console.log('Changes committed and pushed to repository');
    } catch (error) {
        console.error('Error committing changes:', error);
    }
}

// Watch for changes in devices.json
chokidar.watch(devicesFilePath).on('change', async (path) => {
    console.log(`File ${path} has been changed`);
    await commitChanges();
});

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
            console.log(`Request to update device ${id} with status ${status}`);
            const data = await fs.readFile(devicesFilePath, 'utf-8');
            const devices = JSON.parse(data);
            console.log('Current devices:', devices);
            const device = devices.find(d => d.id === parseInt(id));
            if (device) {
                device.status = status;
                await fs.writeFile(devicesFilePath, JSON.stringify(devices, null, 2));
                console.log(`Device ${id} status updated to ${status}`);
                await commitChanges();
                res.status(200).json(device);
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