# 🎬 CINEFLIX - Smart Movie Booking App

Cineflix is a modern, full-stack movie ticketing application equipped with an advanced AI Booking Agent. It allows users to browse movies, find available theaters and showtimes, and book seats seamlessly.

## ✨ Features
- **AI Booking Agent:** An integrated AI assistant that helps users discover movies, find showtimes, and initiates checkout for selected seats—all through natural conversation.
- **Seat Selection:** Interactive seat mapping to easily pick and review available seats before booking.
- **Smart Search & Filters:** Find movies playing in specific cities and on particular dates.
- **User Authentication:** Secure user sign-up, login, and profile management.
- **Responsive UI:** Built with React, offering a mobile-friendly and interactive user experience.

## 🛠️ Technology Stack
- **Frontend:** React.js, Redux (for state management), React Router
- **Backend:** Node.js / Express (handling business logic and MongoDB connections)
- **AI Agent Service:** Python, FastAPI, Langchain, Groq LLM (LLaMA-3)
- **Database:** MongoDB

## 🚀 Deployment
- **Frontend:** Deployed and hosted on [Vercel](https://vercel.com).
- **Backend Service:** Deployed on [Render](https://render.com).
- **AI Agent Service:** Deployed on [Render](https://render.com) (communicates with the Node.js backend to fetch live availability data).

## 💻 Running Locally

### Prerequisites
- Node.js (v16+)
- Python (3.10+)
- MongoDB (Running locally or a cloud URI)

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```
*Ensure you have your `.env` file configured with your Database URI and any necessary API keys.*

### 2. Start the AI Agent Service
```bash
cd agent
pip install -r requirements.txt
# Requires GROQ_API_KEY in agent/.env
uvicorn main:app --reload --port 8000
```

### 3. Start the Frontend Application
```bash
cd front-end
npm install
npm start
```
The frontend will run at `http://localhost:3000`. 

## 🤖 How the AI Agent Works
The AI Assistant lives as a floating chat widget in the frontend. When a user asks a query (e.g., "Book 2 seats for Dunki in Pune tomorrow"):
1. The frontend sends the chat history to the Python FastAPI Agent service.
2. The Agent uses Groq's LLaMA model and function calling to hit the Node.js backend APIs.
3. The Agent fetches the cities, theaters, exact showtimes, and seat availability directly from the database.
4. Once the user confirms, the Agent issues a `CHECKOUT_INTENT`, which the frontend intercepts to automatically route the user to the seat selection checkout gateway!

---
*Created with ❤️ by the Cineflix Team.*