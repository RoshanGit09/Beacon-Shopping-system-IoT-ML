
from flask import Flask, request, jsonify, render_template ,send_file
from groq import Groq
import os
from dotenv import load_dotenv
import requests
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader
import asyncio
from langchain.chains.retrieval_qa.base import RetrievalQA
import google.generativeai as genai
from flask_cors import cross_origin
from werkzeug.utils import secure_filename
import base64
from google.generativeai import GenerativeModel
from pymongo import MongoClient
from flask_cors import CORS


# Load environment variables
load_dotenv()

# API keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

genai.configure(api_key=GOOGLE_API_KEY)
model = GenerativeModel('gemini-1.5-pro')

app = Flask(__name__)
CORS(app) 
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

PROMPT_TEMPLATE = '''You are a professional nutritionist. Given the text containing food-related information, extract and summarize the key nutritional values.  
- Also add the Relevant Context(nutrition value i gave as input ) as it a concise information as a text with heading Nutritional value.
Provide a well-structured response that includes:  
- The macronutrient breakdown (carbohydrates, proteins, and fats).  
- Key vitamins and minerals present in the food.  
- Any dietary considerations (e.g., suitable for diabetics, high protein for muscle gain).  
- A concise, user-friendly summary for better understanding.  

Ensure that the response is factual, clear, and helpful for users looking to understand the nutritional benefits of the given text.
'''
PROMPT_TEMPLATE_recipie = '''You are a smart AI assistant for a digital supermarket. Given a food item or dish name, generate a structured shopping list of required ingredients with appropriate quantities that can be purchased from a store.

The response should include:
- A clear list of ingredients with shop-friendly quantities (e.g., "1 kg of flour", "500 ml of milk", "1 packet of butter").
- Logical grouping of items (spices, vegetables, dairy, grains, etc.).
- Consideration of standard packaging sizes available in stores.
- Alternative options for common dietary preferences or allergies when applicable.

Ensure that the list is detailed, practical, and optimized for easy shopping
no extra message only the list should be in the final response.
Donot add your deepthink message at last only give me the info i asked for.
'''

# RAG Setup Functions


def load_vector_store(persist_directory="./chroma_db_final_db"):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = Chroma(persist_directory=persist_directory,
                          embedding_function=embeddings)
    return vector_store


def create_qa_chain(vector_store):
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro-latest",
        temperature=0.1,
        model_kwargs={
            "max_output_tokens": 8192,
            "top_k": 10,
            "top_p": 0.95
        }
    )
    retriever = vector_store.as_retriever(
        search_type="similarity", search_kwargs={"k": 3})
    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True
    )

# Web Scraping Functions


@app.route('/chat', methods=['POST'])
@cross_origin()
def chat():
    try:
        data = request.json
        print(data)
        if not data or 'user_prompt' not in data:
            return jsonify({"error": "User prompt is required."}), 400

        user_prompt = data['user_prompt']

        greetings = {"hi", "hii", "hello", "hey", "hola", "namaste",'hi there'}
        if user_prompt.lower() in greetings:
            return jsonify({"main_response": "Welcome to BeaconSmart?", "related_cases": []}), 200

        if not isinstance(user_prompt, str) or not user_prompt.strip():
            return jsonify({"error": "Invalid user prompt"}), 400

        try:
            vector_store = load_vector_store()
            qa_chain = create_qa_chain(vector_store)
            rag_response = qa_chain.invoke({"query": user_prompt})
            print(rag_response)
            print(rag_response["result"])
        except Exception as e:
            print(f"RAG system error: {str(e)}")
            return jsonify({"error": "Failed to process with RAG system"}), 500

        # 3. Get Groq Response
        try:
            messages = [
                {"role": "system", "content": PROMPT_TEMPLATE},
                {"role": "user", "content": f"""
                    Question: {user_prompt}
                    Relevant Context: {rag_response['result']}
                """}
            ]

            groq_response = client.chat.completions.create(
                model="llama3-70b-8192",
                messages=messages
            )
        except Exception as e:
            print(f"Groq API error: {str(e)}")
            return jsonify({"error": "Failed to get AI response"}), 500

       
        response_data = {
            "main_response": groq_response.choices[0].message.content,
            }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    
@app.route('/recipe', methods=['POST'])
@cross_origin()
def recipe():
    try:
        data = request.json
        print(data)
        if not data or 'user_prompt' not in data:
            return jsonify({"error": "User prompt is required."}), 400

        user_prompt = data['user_prompt']

        greetings = {"hi", "hii", "hello", "hey", "hola", "namaste"}
        if user_prompt.lower() in greetings:
            return jsonify({"main_response": "Welcome to BeaconSmart?", "related_cases": []}), 200

        if not isinstance(user_prompt, str) or not user_prompt.strip():
            return jsonify({"error": "Invalid user prompt"}), 400

        try:
            messages = [
                {"role": "system", "content": PROMPT_TEMPLATE_recipie},
                {"role": "user", "content": f"""
                    Question: {user_prompt}
                    
                """}
            ]

            groq_response = client.chat.completions.create(
                model="llama3-70b-8192",
                messages=messages
            )
        except Exception as e:
            print(f"Groq API error: {str(e)}")
            return jsonify({"error": "Failed to get AI response"}), 500

       
        response_data = {
            "main_response": groq_response.choices[0].message.content,
            }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    



@app.route('/submit', methods=["POST"])
@cross_origin()
def submit():
    uri = "mongodb+srv://twinnroshan:Roseshopping@cluster0.zf5b3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(uri)
    db = client["ShoppingSys"]
    collection = db["CustomerForms"]
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ["email", "name", "age", "gender"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        favorite_foods = data.get("favorite_foods", [])
        allergic_foods = data.get("allergic_foods", [])
        medical_conditions = data.get("medical_conditions", [])

        if isinstance(favorite_foods, str):
            favorite_foods = [food.strip() for food in favorite_foods.split(",")]
        if isinstance(allergic_foods, str):
            allergic_foods = [food.strip() for food in allergic_foods.split(",")]
        if isinstance(medical_conditions, str):
            medical_conditions = [condition.strip() for condition in medical_conditions.split(",")]

        customer_data = {
            "email": data["email"],
            "name": data["name"],
            "age": int(data["age"]),
            "gender": data["gender"],
            "favorite_foods": favorite_foods,
            "married": data.get("married", False),
            "children": int(data.get("children", 0)),
            "allergic_foods": allergic_foods,
            "medical_conditions": medical_conditions
        }

        collection.insert_one(customer_data)
        return jsonify({"message": "Form submitted successfully!"}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route('/')
def home():
    return render_template('bot.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0',port=5000)
