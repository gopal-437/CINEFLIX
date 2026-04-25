from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from dotenv import load_dotenv

# Tool imports
from tools import get_cities, get_movies_by_city_and_date, get_theaters_by_city, get_movie_showtimes, check_seat_availability

# Langchain / Groq Setup
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

load_dotenv()

app = FastAPI(title="Cineflix AI Agent Service")

# Allow Frontend Origin (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define models for API boundaries
class ChatRequest(BaseModel):
    message: str
    # Simple history passing: e.g. [{"role": "user", "content": "hi"}, {"role": "assistant", "content": "hello"}]
    conversation_history: list[dict] = []

class ChatResponse(BaseModel):
    reply: str
    intent: str | None = None
    data: dict | None = None


# Setup the Agent specific LLM
# We need to make sure GROQ_API_KEY is in the .env file.
try:
    llm = ChatGroq(
        model="llama-3.3-70b-versatile", # Stable function calling model
        temperature=0.2,
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    # Bind tools to the model natively
    tools = [
        get_cities, 
        get_movies_by_city_and_date, 
        get_theaters_by_city, 
        get_movie_showtimes,
        check_seat_availability
    ]
    llm_with_tools = llm.bind_tools(tools)
    
except Exception as e:
    print(f"Warning: LLM initialization failed (likely missing API key). Error: {e}")
    llm_with_tools = None


# System prompt guiding the agent's behavior
SYSTEM_PROMPT = """
You are the Cineflix Booking Agent, a friendly AI assistant for a movie ticketing app.
Your goals:
1. Help users find movies playing in their city on specific dates using `get_movies_by_city_and_date`.
2. Once the user selects a movie, find available theaters and specific show times using `get_movie_showtimes`. You MUST use the `_id` of the movie (e.g. "67ec2a6b...") as the `movie_id` parameter, NOT the movie title.
3. Check seat availability for those shows using `check_seat_availability`. You MUST use the exact database IDs (`theaterId`, `screenId`, and `_id` for movie) and the exact `startTime` string (e.g. "2026-05-11T10:00:00.000Z") obtained from the tool results. Do NOT use human-readable names (like "Galaxy Cinema", "Screen 2", or "The Great Adventure") for the IDs, and do NOT make up show times like "10:00 AM". ALWAYS use the raw database IDs and full ISO date strings.
4. IMPORTANT: ALWAYS present the available options (movies, theaters, timings) to the user FIRST.
5. Do NOT issue a checkout intent immediately. You must wait for the user to explicitly confirm which specific movie, theater, showtime, and seats they want to book.
6. Only after the user explicitly confirms their selection, your strict final step is to issue a CLEAR intent for checkout.

When formatting your final checkout intent reply, MUST reply with the string EXACTLY like this (in JSON format) strictly at the end of your message so the frontend can parse it:
<CHECKOUT_INTENT>
{"movieId": "<id>", "screenId": "<id>", "theaterId": "<id>", "preSelectedSeats": ["<seat1>", "<seat2>"]}
</CHECKOUT_INTENT>

Do not execute the checkout. The Frontend will capture the <CHECKOUT_INTENT> block to redirect them to the Seat Map Payment gateway.
"""

@app.get("/health")
async def health_check():
    return {"status": "Agent Service is alive."}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(req: ChatRequest):
    if not llm_with_tools:
        raise HTTPException(status_code=500, detail="Agent LLM not configured properly. Check GROQ_API_KEY.")

    # Reconstruct history for LangChain
    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    
    for msg in req.conversation_history:
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg.get("content")))
        elif msg.get("role") == "assistant":
            messages.append(AIMessage(content=msg.get("content")))
            
    # Add the latest message
    messages.append(HumanMessage(content=req.message))
    
    # Run the model with tool execution loop (basic implementation)
    # Since tools are bound, if the model decides to use a tool, it returns a tool_call
    response = await llm_with_tools.ainvoke(messages)
    
    # Handle Tool Calling loop
    tool_map = {tool.__name__: tool for tool in tools}
    
    max_tool_iterations = 3
    iterations = 0
    
    while response.tool_calls and iterations < max_tool_iterations:
        messages.append(response) # Append the AIMessage with tool_calls
        
        for tool_call in response.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            print(f"-> Agent is calling tool: {tool_name} with args: {tool_args}")
            
            tool_func = tool_map.get(tool_name)
            if tool_func:
                tool_result = await tool_func(**tool_args)
                # Langchain expects a ToolMessage
                from langchain_core.messages import ToolMessage
                messages.append(ToolMessage(content=str(tool_result), tool_call_id=tool_call["id"]))
            else:
                 messages.append(ToolMessage(content="Tool not found.", tool_call_id=tool_call["id"]))
                 
        # Re-invoke model with tool responses
        response = await llm_with_tools.ainvoke(messages)
        iterations += 1

    final_reply_text = str(response.content)
    
    # Parse Intent Custom Logic
    intent = "general_chat"
    checkout_data = None
    
    if "<CHECKOUT_INTENT>" in final_reply_text:
        intent = "checkout_intent"
        try:
            # Extract JSON from the tags
            json_str = final_reply_text.split("<CHECKOUT_INTENT>")[1].split("</CHECKOUT_INTENT>")[0].strip()
            checkout_data = json.loads(json_str)
            # Remove the intent block from the user-facing text
            final_reply_text = final_reply_text.split("<CHECKOUT_INTENT>")[0].strip()
        except:
            print("Failed to parse checkout intent.")
    
    return ChatResponse(
        reply=final_reply_text,
        intent=intent,
        data=checkout_data
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
