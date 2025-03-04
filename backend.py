from flask import Flask, jsonify, render_template, request
from flask_cors import CORS, cross_origin
import asyncio
from bleak import BleakScanner
from threading import Thread
from pymongo import MongoClient
from groq import Groq
import json

app = Flask(__name__)
CORS(app)

# MongoDB Connection
uri = "mongodb+srv://twinnroshan:Roseshopping@cluster0.zf5b3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)
db = client['ShoppingSys']  
collection = db['UserData']
medical_collection = db['CustomerForms']  # Collection for medical records

# Initialize Groq client
groq_client = Groq(api_key="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")

TARGET_DEVICE_NAME = "MyBLEBeacon"
current_data = None
current_user_id = None  # Store the current user ID

def fetch_product_from_db(message):
    product = collection.find_one({"RACK": message})
    if product:
        return {key: value for key, value in product.items() if key != "_id"}
    return {"error": "Product not found"}

def fetch_user_medical_record(user_id):

    medical_record = medical_collection.find_one({"email": user_id})
    if medical_record:
        return {key: value for key, value in medical_record.items() if key != "_id"}
    return {"health_conditions": []}

def analyze_products_with_llm(products, medical_record):
    
  
    product_items = []
    for key, value in products.items():
        if key.startswith('Item-'):
            product_items.append(value)
    user_details=medical_record
    print(medical_record)

    # prompt = f"""
    # Given a user with the following health conditions: {medical_record}
    # Please analyze the following products and provide recommendations:
    # {product_items}
    
    # Sort these products from most recommended to least recommended based on the user's health conditions.
    # For each product, explain if it's recommended or not. If a product is not recommended due to a health condition, 
    # please specify why and add a warning message.
    
    # Return the result as a JSON with the following structure:
    # {{
    #     "sorted_products": [
    #         {{
    #             "name": "product name",
    #             "recommendation": "recommended" or "not recommended" or "neutral-consumeable" or "consume-with-caution",
    #             "reason": "explanation",
    #             "warning": "warning message if applicable"
    #         }}
    #     ]
    # }}
    # """
    
    prompt = f"""
Given a user with the following personal details:  
- Name: {user_details['name']}  
- Age: {user_details['age']}  
- Gender: {user_details['gender']}  
- Favorite Foods: {', '.join(user_details['favorite_foods'])}  
- Allergic Foods: {', '.join(user_details['allergic_foods'])}  
- Medical Conditions: {', '.join(user_details['medical_conditions'])}  
- Married: {user_details['married']}  
- Number of Children: {user_details['children']}  

Analyze the given products based on the user's profile and provide personalized recommendations. Consider factors such as:  
1. Age-related dietary needs  
2. Medical conditions and dietary restrictions  
3. Allergies and potential risks  
4. Parental responsibilities (if they have children, suggest suitable products for them)  
5. Favorite foods and potential preferences  

Here are the products for analysis:  
{product_items}

Sort these products from most recommended to least recommended based on the user's health and lifestyle.  
For each product, provide:  
- A recommendation status:  
  - "highly recommended"  
  - "recommended"  
  - "consume with caution"  
  - "not recommended"  
- A reason for the recommendation  
- A warning if the product is unsuitable  

Return the result as a JSON with the following structure:  

{{
    "sorted_products": [
        {{
            "name": "product name",
            "recommendation": "highly recommended" or "recommended" or "consume with caution" or "not recommended",
            "reason": "explanation",
            "warning": "warning message if applicable"
        }}
    ]
}}
"""

  
    
    try:
        messages = [
            {"role": "system", "content": "You are a health-conscious shopping assistant that helps users make informed decisions based on their medical conditions."},
            {"role": "user", "content": prompt}
        ]
        
        groq_response = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=messages
        )
        
        response_text = groq_response.choices[0].message.content
        
           
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        else:
            return {"error": "Could not extract JSON from LLM response"}
        
    except Exception as e:
        print(f"Error calling Groq LLM: {e}")
        return {"error": f"LLM analysis failed: {str(e)}"}

async def scan_ble():
    global current_data
    previous_message = None 
    
    while True:
        print("Scanning for target BLE device...")
        try:
            devices = await BleakScanner.discover()
            for device in devices:
                if device.name == TARGET_DEVICE_NAME:
                    print(f"Found {TARGET_DEVICE_NAME} at {device.address}")

                    advertisement_data = device.metadata.get("manufacturer_data", {})
                    formatted_data = {}
                    
                    for key, data in advertisement_data.items():
                        if isinstance(data, (bytes, bytearray)):
                            decoded_msg = data.decode("utf-8", errors="ignore").strip()
                        else:
                            decoded_msg = str(data)
                        formatted_data[key] = decoded_msg

                    received_message = next(iter(formatted_data.values()), "No message")
                    
                    if received_message != previous_message:
                        previous_message = received_message
                        
                        product_info = fetch_product_from_db(received_message)
                        
                        analyzed_products = None
                        if current_user_id and product_info and "error" not in product_info:
                            medical_record = fetch_user_medical_record(current_user_id)
                            
                            analyzed_products = analyze_products_with_llm(product_info, medical_record)
                            print(f"Product analyzed for user {current_user_id}")
                            
                        name = medical_collection.find_one({"email": current_user_id}, {"name": 1, "_id": 0})
                        
                        current_data = {
                            "address": device.address,
                            "advertised_message": received_message,
                            "product_info": product_info,
                            "analyzed_products": analyzed_products
                        }
                        print(f"Updated Data: {current_data}")
        except Exception as e:
            print(f"Error during BLE scanning: {e}")
        
        await asyncio.sleep(5)

@app.route('/get_device', methods=['GET'])
@cross_origin()
def get_device():

    user_id = request.args.get('email')
    
    if current_data:
        response_data = current_data.copy()
        
        if user_id and 'product_info' in current_data and current_data['product_info']:
            need_analysis = False
            
         
            if 'analyzed_products' not in current_data or not current_data['analyzed_products']:
                need_analysis = True
                
            if need_analysis:
                medical_record = fetch_user_medical_record(user_id)
                analysis_result = analyze_products_with_llm(current_data['product_info'], medical_record)
                response_data['analyzed_products'] = analysis_result
                
                current_data['analyzed_products'] = analysis_result
                print(f"Product analyzed for user {user_id} via API endpoint")
        
        return jsonify(response_data)
    else:
        return jsonify({"error": f"{TARGET_DEVICE_NAME} not found"}), 404
@app.route('/clear_user', methods=['POST'])
@cross_origin()
def clear_user():
    """Clear the current user ID."""
    global current_user_id
    current_user_id = None
    return jsonify({"message": "User cleared successfully"})

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