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
                    <td contenteditable="false">${device.id}</td>
                    <td contenteditable="false">${device.name}</td>
                    <td>
                        <select>
                            <option value="Type 1" ${device.type === 'Type 1' ? 'selected' : ''}>Type 1</option>
                            <option value="Type 2" ${device.type === 'Type 2' ? 'selected' : ''}>Type 2</option>
                            <option value="Type 3" ${device.type === 'Type 3' ? 'selected' : ''}>Type 3</option>
                        </select>
                    </td>
                    <td>
                        <select>
                            <option value="Active" ${device.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Inactive" ${device.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </td>
                    <td><button onclick="saveRow(this)">Save</button></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching devices:', error));
}

function showSection(sectionId) {
    var sections = document.querySelectorAll('section');
    sections.forEach(function(section) {
        if (section.id === sectionId) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

function saveRow(button) {
    var row = button.parentNode.parentNode;
    var typeCell = row.cells[2]; // Assuming the type cell is the 3rd cell in the row
    var statusCell = row.cells[3]; // Assuming the status cell is the 4th cell in the row
    var typeSelect = typeCell.querySelector('select');
    var statusSelect = statusCell.querySelector('select');
    var newType = typeSelect.value;
    var newStatus = statusSelect.value;
    var deviceId = row.cells[0].textContent;

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
        alert('Updated Successfully');
    })
    .catch(error => {
        console.error('Error updating device:', error);
        alert('Update failed. Please refresh the page');
    });
}