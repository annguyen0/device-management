document.addEventListener('DOMContentLoaded', function() {
    fetchDevices();
});

function fetchDevices() {
    fetch('/api/devices')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('device-table-body');
            tableBody.innerHTML = '';
            data.forEach(device => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td contenteditable="false">${device.id}</td>
                    <td contenteditable="false">${device.name}</td>
                    <td contenteditable="false">${device.type}</td>
                    <td contenteditable="false">${device.status}</td>
                    <td><button onclick="editRow(this)">Update</button></td>
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

function editRow(button) {
    var row = button.parentNode.parentNode;
    var statusCell = row.cells[3]; // Assuming the status cell is the 4th cell in the row

    if (button.textContent === "Update") {
        var currentStatus = statusCell.textContent;
        var select = document.createElement("select");
        var optionActive = document.createElement("option");
        optionActive.value = "Active";
        optionActive.text = "Active";
        var optionInactive = document.createElement("option");
        optionInactive.value = "Inactive";
        optionInactive.text = "Inactive";

        select.appendChild(optionActive);
        select.appendChild(optionInactive);

        if (currentStatus === "Active") {
            select.value = "Active";
        } else {
            select.value = "Inactive";
        }

        statusCell.textContent = "";
        statusCell.appendChild(select);
        button.textContent = "Save";
    } else {
        var select = statusCell.querySelector("select");
        var newStatus = select.value;
        statusCell.removeChild(select);
        statusCell.textContent = newStatus;
        button.textContent = "Update";

        // Send updated data to the server
        var deviceId = row.cells[0].textContent;
        updateDeviceStatus(deviceId, newStatus);
    }
}

function updateDeviceStatus(deviceId, newStatus) {
    fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Device status updated:', data);
    })
    .catch(error => console.error('Error updating device status:', error));
}