from flask import Flask, jsonify, render_template
from flask_cors import CORS
import asyncio
from bleak import BleakScanner
from threading import Thread
from pymongo import MongoClient
from flask_cors import cross_origin

app = Flask(__name__)
CORS(app)


uri = "mongodb+srv://twinnroshan:Roseshopping@cluster0.zf5b3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)
db = client['ShoppingSys']  
collection = db['UserData']  


TARGET_DEVICE_NAME = "MyBLEBeacon"  
current_data = None


def fetch_product_from_db(message):
    
    product = collection.find_one({"RACK": message})
    if product:
        return {key: value for key, value in product.items() if key != "_id"}  
    return {"error": "Product not found"}


async def scan_ble():
    
    global current_data
    while True:
        print("Scanning for target BLE device...")
        # current_data = {
        #                 "address": 123456,
        #                 "advertised_message": 'Items For You from the Rack',
        #                 "product_info": ['milk', 'bread', 'butter']
        #             }
        try:
            devices = await BleakScanner.discover()
            for device in devices:
                if device.name == TARGET_DEVICE_NAME:
                    print(f" Found {TARGET_DEVICE_NAME} at {device.address}")

                    advertisement_data = device.metadata.get("manufacturer_data", {})
                    formatted_data = {}
                    
                    for key, data in advertisement_data.items():
                        if isinstance(data, (bytes, bytearray)):
                            decoded_msg = data.decode("utf-8", errors="ignore").strip()
                        else:
                            decoded_msg = str(data)
                        formatted_data[key] = decoded_msg

                    received_message = next(iter(formatted_data.values()), "No message")
                    product_info = fetch_product_from_db(received_message)

                    current_data = {
                        "address": device.address,
                        "advertised_message": received_message,
                        "product_info": product_info
                    }
                    print(f"Updated Data: {current_data}")
        except Exception as e:
            print(f" Error during BLE scanning: {e}")
        
        await asyncio.sleep(5)  


@app.route('/get_device', methods=['GET'])
@cross_origin()
def get_device():
    
    if current_data:
        return jsonify(current_data)
    else:
        return jsonify({"error": f"{TARGET_DEVICE_NAME} not found"}), 404


@app.route('/')
def index():
    
    return render_template("index.html", device_data=current_data)


def run_flask():
    
    app.run(host="0.0.0.0", port=8080, use_reloader=False)


def main():
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(scan_ble())
    flask_thread = Thread(target=run_flask, daemon=True)
    flask_thread.start()
    try:
        loop.run_forever()
    except KeyboardInterrupt:
        print("Server stopped.")


if __name__ == "__main__":
    main()