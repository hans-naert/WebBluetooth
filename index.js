var bluetoothDevice;
var readCharacteristic;

const UUID_SERV_1 = "0000a002-0000-1000-8000-00805f9b34fb";
const UUID_READ_CHAR = "0000c300-0000-1000-8000-00805f9b34fb";
const UUID_WRITE_CHAR = "0000c304-0000-1000-8000-00805f9b34fb";

log = (text) => {
    let div = document.createElement('div');
    div.textContent = text;
    document.querySelector('#log').appendChild(div);
}

async function onConnectButtonClick() {
    try {
        if (!bluetoothDevice) {
            await requestDevice();
        }
        await connectDeviceAndCacheCharacteristics();
        
    } catch (error) {
        log('Argh! ' + error);
    }
}

async function onReadButtonClick() {
    try {
        log('Reading data...');
        await readCharacteristic.readValue();
    } catch (error) {
        log('Argh! ' + error);
    }
}

async function onWriteButtonClick() {
    try {
        log('Writing data...');
        let arrayBuffer = new TextEncoder().encode("Hello World");
        await writeCharacteristic.writeValue(arrayBuffer);
    } catch (error) {
        log('Argh! ' + error);
    }
}


async function requestDevice() {
    log('Requesting any Bluetooth Device...');
    bluetoothDevice = await navigator.bluetooth.requestDevice({
        // filters: [...] <- Prefer filters to save energy & show relevant devices.
        acceptAllDevices: true,
        optionalServices: [UUID_SERV_1]
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
    const service = await server.getPrimaryService(UUID_SERV_1);

    log('Getting Key Characteristic...');
    readCharacteristic = await service.getCharacteristic(UUID_READ_CHAR);
    writeCharacteristic = await service.getCharacteristic(UUID_WRITE_CHAR);

    readCharacteristic.addEventListener('characteristicvaluechanged',
        handleKeyChanged);
    //document.querySelector('#startNotifications').disabled = false;
    //document.querySelector('#stopNotifications').disabled = true;
}

/* This function will be called when `readValue` resolves and
 * characteristic value changes since `characteristicvaluechanged` event
 * listener has been added. */
function handleKeyChanged(event) {
    let key = event.target.value.getUint8(0);
    log('> Key is ' + key);
}

/*async function onStartNotificationsButtonClick() {
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
}*/

function onResetButtonClick() {
    if (readCharacteristic) {
        readCharacteristic.removeEventListener('characteristicvaluechanged',
            handleKeyChanged);
        readCharacteristic = null;
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