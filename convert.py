import os
import warnings
from typing import List
from dotenv import load_dotenv
load_dotenv()

warnings.filterwarnings('ignore')

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

def load_texts(directory: str) -> List[Document]:
    all_documents = []
    for filename in os.listdir(directory):
        if filename.endswith(".txt"):
            file_path = os.path.join(directory, filename)
            try:
                with open(file_path, "r", encoding="utf-8") as file:
                    content = file.read()
                    doc = Document(page_content=content, metadata={"source": filename})
                    all_documents.append(doc)
            except Exception as e:
                print(f"Error loading text file {file_path}: {e}")
    return all_documents

def split_documents(documents: List[Document], chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Document]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, 
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    return text_splitter.split_documents(documents)

def create_vector_store(documents: List[Document], persist_directory: str = "./chroma_db_final_db"):
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = Chroma.from_documents(documents, embeddings, persist_directory=persist_directory)
        vector_store.persist()
        print(f"Chroma database saved to {persist_directory}")
    except Exception as e:
        print(f"Error creating vector store: {e}")

def main():
    text_directory = "./texts"  # Directory containing text files
    persist_directory = "./chroma_db_final_db"  
    
    documents = load_texts(text_directory)
    if not documents:
        return
    
    split_docs = split_documents(documents)
    
    create_vector_store(split_docs, persist_directory)

if __name__ == "__main__":
    main()