# BLE communication with ESP

Documentation: [AT Commands - BLE](https://docs.espressif.com/projects/esp-at/en/latest/esp32/AT_Command_Set/BLE_AT_Commands.html)

Examples: [ESP AT command Examples - BLE](https://docs.espressif.com/projects/esp-at/en/latest/esp32/AT_Command_Examples/bluetooth_le_at_examples.html#bluetooth-le-client-reads-and-write-services)

## Start the GATT Server on the ESP
Each line of code needs to end with a return and a newline. So in Putty, end a line with a return and then ALT+10 for the newline.  

Initialize and start GATT Server:  
```text
AT+BLEINIT=2
AT+BLEGATTSSRVCRE
AT+BLEGATTSSRVSTART
```

Set the BLE device name.
This can (optionally) be stored in NVS with command `AT+SYSSTORE=1`.
```text
AT+BLENAME="BLADDER1"
```

Start advertising:  
```text
AT+BLEADVSTART
```

## Connect a client and open the service

Connect now with the client, the ESP outputs the following:
 ```text
+BLECONN:0,"6d:38:c8:16:fc:23"
+BLECONNPARAM:0,0,0,6,0,500
+BLECFGMTU:0,517
+BLECONNPARAM:0,0,0,39,0,500
```
 
Open Service 0000A002-0000-1000-8000-00805F9B34FB in a Client.

## Client writes a characteristic
When a client perfoms a write with ASCII characters "Hello Vives" to characteristic 0000C303-0000-1000-8000-00805F9B34FB, the ESP outputs the following:
```text
+WRITE:0,1,4,,11,Hello Vives
```

## Setting a characteristic on the server

List services on GATT Server:
```text
AT+BLEGATTSCHAR?
```

List characteristics on GATT Server:
```text
AT+BLEGATTSSRV?
```

Set one byte of first characteristic at first service
```text
AT+BLEGATTSSETATTR=1,1,,1
```
The ESP sends now `>` and waits for 1 byte, after a byte is provided, OK is shown.


## Client reads a characterisctic
When a client performs a read to characteristic 0000C300-0000-1000-8000-00805F9B34FB, the ESP outputs the following:
 ```text
+READ:0,"6d:38:c8:16:fc:23"
```