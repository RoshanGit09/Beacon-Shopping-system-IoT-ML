from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# MongoDB connection URI
uri = "mongodb+srv://twinnroshan:Roseshopping@cluster0.zf5b3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Select the database
db = client["ShoppingSys"]  # Replace with your database name

# Select the collection
collection = db["UserData"]  # Replace with your collection name

# Sample document to insert
product_data = {
    "RACK": "MART-RACK-2",
    "Item-1": "maida",
    "Item-2": "cake",
    "Item-3": "sugar",
    "Item-4": "biscuit",
}

# Insert the document into the collection
result = collection.insert_one(product_data)

# Print the inserted document ID
print("Inserted document ID:", result.inserted_id)
