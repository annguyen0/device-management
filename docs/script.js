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
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${device.id}</td>
                    <td>${device.name}</td>
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
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching devices:', error));
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
    const typeCell = row.cells[2]; // Assuming the type cell is the 3rd cell in the row
    const statusCell = row.cells[3]; // Assuming the status cell is the 4th cell in the row
    const typeSelect = typeCell.querySelector('select');
    const statusSelect = statusCell.querySelector('select');
    const newType = typeSelect.value;
    const newStatus = statusSelect.value;
    const deviceId = row.cells[0].textContent;

    console.log(`Updating device ${deviceId} to type ${newType} and status ${newStatus}`);
    updateDevice(deviceId, newType, newStatus);
}

function updateDevice(deviceId, newType, newStatus) {
    fetch(`/api/devices?id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: newType, status: newStatus })
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

function showStatusMessage(message, type) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
    statusMessage.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 3000);
}