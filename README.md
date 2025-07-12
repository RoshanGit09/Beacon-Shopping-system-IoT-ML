# 🛒 Smart Shopping System Using Beacon Technology

> A personalized, AI-powered IoT-based smart retail system that integrates BLE beacons, computer vision, LLMs, and dynamic pricing to offer a health-conscious and user-centric shopping experience.

---

## 📌 Overview

In an era of personalized experiences and health awareness, this project presents an **AI-integrated IoT solution** that enhances in-store supermarket shopping using **Bluetooth Low Energy (BLE) Beacons**, **Vision-Language Models**, and **LLMs** for real-time product guidance, nutrition awareness, and dynamic pricing.

Users receive **location-aware product info**, **AI-driven dietary advice**, **freshness-based pricing**, and **custom recipe suggestions**, all via a **React Native app** backed by a Flask API.

---

## 🚀 Features

- 🔗 **BLE-Based Rack Detection** – Uses Arduino Nano 33 IoT beacons to detect user proximity and trigger product info.
- 🤖 **YOLOv11-L for Object Detection** – Real-time identification of fruits and vegetables.
- 🧠 **LLaVA + VLMs** – Analyze freshness levels from captured images for dynamic pricing.
- 🩺 **LLM-based Nutrition Chatbot** – RAG-enabled chatbot using LLaMA 3.1 8B-Instant and Gemini embeddings for dietary guidance.
- 🍲 **Recipe Recommendation Engine** – Web scraped recipes using **Serper.AI** and **ScrapeGraph**, filtered based on user health profiles.
- 🔐 **Personalization & Medical Profiling** – User preferences, medical conditions, and dietary filters stored securely via Firebase + MongoDB.
- 📊 **Dynamic Pricing Engine** – Price adjustments based on quality and freshness detected via computer vision.
- 📱 **Cross-platform Mobile App** – Built with React Native and integrated with Flask backend.

---

## 🧠 Tech Stack

### 💡 Frontend
- **React Native** – Cross-platform mobile development
- **Firebase Authentication** – Secure user login and signup
- **UI** – Real-time product listing, chatbot, and recipe viewer

### ⚙️ Backend
- **Python (Flask)** – REST API and logic orchestration
- **MongoDB** – NoSQL database (collections: `UserDetails`, `RackDetails`, `ProductInformation`)
- **ChromaDB** – Vector database for storing embeddings
- **BigBasket API** – Used for live pricing (optional integration)

### 🧠 AI & Machine Learning
- **YOLOv11-L** – Real-time object detection on produce
- **LLaVA (VLM)** – Image-to-text reasoning for freshness estimation
- **LLaMA 3.1 8B-Instant via Groq** – Fast LLM inference for nutrition chatbot
- **Gemini Flash 2.5** – Table extraction from ICMR PDFs
- **Gemini Embeddings** – Embedding generation for RAG
- **Retrieval-Augmented Generation (RAG)** – Personalized, medically-aware responses

### 🌐 Web Scraping & Recipes
- **Serper.AI** – Google-like search interface for food blogs
- **ScrapeGraph** – Graph-based scraping of structured recipe data

### 📡 IoT
- **Arduino Nano 33 IoT** – BLE beacon broadcasting Rack IDs
- **ArduinoBLE Library** – BLE packet customization and advertisement

---

## 📷 Flow

<img width="1920" height="1080" alt="workflow" src="https://github.com/user-attachments/assets/d0ad44c1-fb02-4769-a02b-d01f3df2b260" />


---

## 🧪 Model Performance

- **YOLOv11-L Evaluation**
  - mAP@0.5:0.95: `0.681`
  - Precision: `0.735`
  - Recall: `0.817`
  - Best Class: Apple (Precision: 0.965, Recall: 1.000)

- **LLM Chatbot**
  - Uses **ICMR datasets** for nutrition accuracy
  - ~100ms latency using **Groq** inference API

---

## 🧱 Architecture

```text
BLE Beacons (Arduino) 
        ↓ 
React Native App  ←→ Flask API ←→ MongoDB
        ↓                     ↓
  User Interaction     YOLOv11-L + LLaVA
        ↓                     ↓
 Chatbot (RAG) ←→ ChromaDB ←→ Serper.AI + Recipes
