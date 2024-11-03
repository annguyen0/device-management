document.addEventListener('DOMContentLoaded', function() {
    fetchDevices();
});

function fetchDevices() {
    console.log('Fetching devices...');
    fetch('/api/devices')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Devices fetched:', data);
            const tableBody = document.getElementById('device-table-body');
            tableBody.innerHTML = '';
            data.forEach(device => {
                const row = createDeviceRow(device);
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching devices:', error));
}

function createDeviceRow(device) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${device.id || ''}</td>
        <td><input type="text" value="${device.name || ''}" class="form-control"></td>
        <td>
            <select class="form-control">
                <option value="Type 1" ${device.type === 'Type 1' ? 'selected' : ''}>Type 1</option>
                <option value="Type 2" ${device.type === 'Type 2' ? 'selected' : ''}>Type 2</option>
                <option value="Type 3" ${device.type === 'Type 3' ? 'selected' : ''}>Type 3</option>
            </select>
        </td>
        <td>
            <select class="form-control">
                <option value="Active" ${device.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Inactive" ${device.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
        </td>
        <td><button class="btn btn-primary" onclick="saveRow(this)">Save</button></td>
    `;
    return row;
}

function addNewDevice() {
    const tableBody = document.getElementById('device-table-body');
    const newRow = createDeviceRow({ id: '', name: '', type: 'Type 1', status: 'Active' });
    tableBody.appendChild(newRow);
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('home-active');
    });

    if (sectionId === 'home') {
        document.querySelector('.home-tab').classList.add('home-active');
    }

    // Update the URL hash
    window.location.hash = sectionId;
}

function saveRow(button) {
    const row = button.parentNode.parentNode;
    const idCell = row.cells[0];
    const nameCell = row.cells[1].querySelector('input');
    const typeCell = row.cells[2].querySelector('select');
    const statusCell = row.cells[3].querySelector('select');
    const deviceId = idCell.textContent || null;
    const newName = nameCell.value;
    const newType = typeCell.value;
    const newStatus = statusCell.value;

    console.log(`Updating device ${deviceId} to name ${newName}, type ${newType}, and status ${newStatus}`);
    if (deviceId) {
        updateDevice(deviceId, newName, newType, newStatus);
    } else {
        createDevice(newName, newType, newStatus);
    }
}

function updateDevice(deviceId, newName, newType, newStatus) {
    fetch(`/api/devices?id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: deviceId, name: newName, type: newType, status: newStatus })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Device updated:', data);
        showStatusMessage('Updated Successfully', 'success');
    })
    .catch(error => {
        console.error('Error updating device:', error);
        showStatusMessage('Update failed. Please refresh the page', 'error');
    });
}

function createDevice(newName, newType, newStatus) {
    fetch('/api/devices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName, type: newType, status: newStatus })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Device created:', data);
        showStatusMessage('Created Successfully', 'success');
        fetchDevices(); // Refresh the device list
    })
    .catch(error => {
        console.error('Error creating device:', error);
        showStatusMessage('Creation failed. Please refresh the page', 'error');
    });
}

function showStatusMessage(message, type) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
    statusMessage.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 3000);
}