
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



# Load environment variables
load_dotenv()

# API keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

genai.configure(api_key=GOOGLE_API_KEY)
model = GenerativeModel('gemini-1.5-pro')

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

PROMPT_TEMPLATE = '''Extract out nutririont information from the given text and provide a summary of the same'''
PROMPT_TEMPLATE_recipie = '''List me out the ingredients required for the given food item and give me as list so the user can buy it from the store'''

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
        if not data or 'user_prompt' not in data:
            return jsonify({"error": "User prompt is required."}), 400

        user_prompt = data['user_prompt']

        greetings = {"hi", "hii", "hello", "hey", "hola", "namaste"}
        if user_prompt in greetings:
            return jsonify({"main_response": "Welcome to DigiSupermart?", "related_cases": []}), 200

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
                model="llama3-8b-8192",
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
        if not data or 'user_prompt' not in data:
            return jsonify({"error": "User prompt is required."}), 400

        user_prompt = data['user_prompt']

        greetings = {"hi", "hii", "hello", "hey", "hola", "namaste"}
        if user_prompt in greetings:
            return jsonify({"main_response": "Welcome to DigiSupermart?", "related_cases": []}), 200

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
                model="llama3-8b-8192",
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

@app.route('/')
def home():
    return render_template('bot.html')


if __name__ == '__main__':
    app.run(debug=True)
