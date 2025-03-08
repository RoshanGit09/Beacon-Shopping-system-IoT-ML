from flask import Flask, request, render_template, jsonify
from pymongo import MongoClient

app = Flask(__name__)

# MongoDB connection
uri = "mongodb+srv://twinnroshan:Roseshopping@cluster0.zf5b3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)
db = client["ShoppingSys"]
collection = db["CustomerForms"]

@app.route('/')
def form():
    return render_template("form.html")

@app.route('/submit', methods=["POST"])
def submit():
    data = request.json  # Receive JSON data
    customer_data = {
        "name": data["name"],
        "age": int(data["age"]),
        "gender": data["gender"],
        "favorite_foods": [food.strip() for food in data["favorite_foods"]],
        "married": data["married"],
        "children": int(data["children"]),
        "allergic_foods": [food.strip() for food in data["allergic_foods"]],
        "medical_conditions": [condition.strip() for condition in data["medical_conditions"]]
    }

    collection.insert_one(customer_data)
    return jsonify({"message": "Form submitted successfully!"})

if __name__ == '__main__':
    app.run(debug=True)
