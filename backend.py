from flask import Flask, jsonify
from flask_cors import CORS
import asyncio
from bleak import BleakScanner

app = Flask(__name__)
CORS(app)

current_message = None  # Store the last received message

async def scan_ble():
    global current_message
    while True:
        print("Scanning for BLE devices...")
        try:
            devices = await BleakScanner.discover()
            for device in devices:
                if device.name == "MyBLEBeacon":  
                    print(f"Discovered Device: {device}")

                    advertisement_data = device.metadata.get("manufacturer_data", {})
                    print(f"Advertisement Data: {advertisement_data}")

                    for key, data in advertisement_data.items():
                        if data:  # Check if data is not empty
                            try:
                                decoded_message = data.decode('utf-8', errors='ignore').strip()
                                current_message = decoded_message
                                print(f"Received Message: {current_message}")
                            except Exception as e:
                                print(f"Error decoding message: {e}")

        except Exception as e:
            print(f"Error during BLE scanning: {e}")

        await asyncio.sleep(5)

@app.route('/get_message', methods=['GET'])
def get_message():
    return jsonify({"advertised_message": current_message})

def run_flask():
    app.run(host="0.0.0.0", port=8080, use_reloader=False)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.create_task(scan_ble())

    from threading import Thread
    flask_thread = Thread(target=run_flask, daemon=True)
    flask_thread.start()

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        print("Server stopped.")
