function toggleDeviceList() {
    var deviceListSection = document.getElementById('device-list');
    if (deviceListSection.style.display === 'none' || deviceListSection.style.display === '') {
        deviceListSection.style.display = 'block';
    } else {
        deviceListSection.style.display = 'none';
    }
}