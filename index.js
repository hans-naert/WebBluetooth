var bluetoothDevice;
var keyCharacteristic;

const UUID_KEY_SERV = "0000ffe0-0000-1000-8000-00805f9b34fb";
const UUID_KEY_DATA = "0000ffe1-0000-1000-8000-00805f9b34fb";

log = (text) => {
    let div = document.createElement('div');
    div.textContent = text;
    document.querySelector('#log').appendChild(div);
}

async function onReadKeyButtonClick() {
    try {
        if (!bluetoothDevice) {
            await requestDevice();
        }
        await connectDeviceAndCacheCharacteristics();

        log('Reading Key...');
        await keyCharacteristic.readValue();
    } catch (error) {
        log('Argh! ' + error);
    }
}

async function requestDevice() {
    log('Requesting any Bluetooth Device...');
    bluetoothDevice = await navigator.bluetooth.requestDevice({
        // filters: [...] <- Prefer filters to save energy & show relevant devices.
        acceptAllDevices: true,
        optionalServices: [UUID_KEY_SERV]
    });
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
}

async function connectDeviceAndCacheCharacteristics() {
    if (bluetoothDevice.gatt.connected && keyCharacteristic) {
        return;
    }

    log('Connecting to GATT Server...');
    const server = await bluetoothDevice.gatt.connect();

    log('Getting Key Service...');
    const service = await server.getPrimaryService(UUID_KEY_SERV);

    log('Getting Key Characteristic...');
    keyCharacteristic = await service.getCharacteristic(UUID_KEY_DATA);

    keyCharacteristic.addEventListener('characteristicvaluechanged',
        handleKeyChanged);
    document.querySelector('#startNotifications').disabled = false;
    document.querySelector('#stopNotifications').disabled = true;
}

/* This function will be called when `readValue` resolves and
 * characteristic value changes since `characteristicvaluechanged` event
 * listener has been added. */
function handleKeyChanged(event) {
    let key = event.target.value.getUint8(0);
    log('> Key is ' + key);
}

async function onStartNotificationsButtonClick() {
    try {
        log('Starting Key Notifications...');
        await keyCharacteristic.startNotifications();

        log('> Notifications started');
        document.querySelector('#startNotifications').disabled = true;
        document.querySelector('#stopNotifications').disabled = false;
    } catch (error) {
        log('Argh! ' + error);
    }
}

async function onStopNotificationsButtonClick() {
    try {
        log('Stopping Key Notifications...');
        await keyCharacteristic.stopNotifications();

        log('> Notifications stopped');
        document.querySelector('#startNotifications').disabled = false;
        document.querySelector('#stopNotifications').disabled = true;
    } catch (error) {
        log('Argh! ' + error);
    }
}

function onResetButtonClick() {
    if (keyCharacteristic) {
        keyCharacteristic.removeEventListener('characteristicvaluechanged',
            handleKeyChanged);
        keyCharacteristic = null;
    }
    // Note that it doesn't disconnect device.
    bluetoothDevice = null;
    log('> Bluetooth Device reset');
}

async function onDisconnected() {
    log('> Bluetooth Device disconnected');
    try {
        await connectDeviceAndCacheCharacteristics()
    } catch (error) {
        log('Argh! ' + error);
    }
}