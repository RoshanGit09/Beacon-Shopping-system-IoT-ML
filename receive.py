import asyncio
from bleak import BleakScanner

TARGET_DEVICE = "MyBLEBeacon" 

async def scan_ble():
    print("Scanning for BLE devices...")

    def callback(device, advertisement_data):
        if device.name == TARGET_DEVICE:
            print(f" Found {TARGET_DEVICE} at {device.address}")
            manufacturer_data = advertisement_data.manufacturer_data
            for _, data in manufacturer_data.items():
                try:
                    received_message = data.decode("utf-8", errors="ignore").strip()
                    print(f" Received Message: {received_message}")
                except Exception as e:
                    print(f" Error decoding message: {e}")

    scanner = BleakScanner(callback)
    await scanner.start()
    await asyncio.sleep(10) 
    await scanner.stop()
    print("Scan complete.")

asyncio.run(scan_ble())
