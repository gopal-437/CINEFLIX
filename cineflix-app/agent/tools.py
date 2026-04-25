import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

# We expect the MERN backend URL to be provided via environment logic
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

def _trim_data(data, keys_to_keep, max_items=20):
    if not isinstance(data, list):
        return data
    trimmed = []
    for item in data[:max_items]:
        if isinstance(item, dict):
            trimmed.append({k: item[k] for k in keys_to_keep if k in item})
        else:
            trimmed.append(item)
    return trimmed

async def get_cities() -> str:
    """Gets a list of all available cities for movie bookings."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/api/cities")
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list):
                labels = [city.get("label", "") for city in data]
                return json.dumps(labels[:30]) + " ... (and many more cities are supported. Just ask the user.)"
            return str(data)[:500]
        except Exception as e:
            return f"Error fetching cities: {str(e)}"

async def get_movies_by_city_and_date(city: str, date: str) -> str:
    """
    Finds movies available in a specific city on a specific date.
    Args:
        city: Name of the city (e.g. Pune, Mumbai).
        date: Date in string format (e.g. 2026-05-01 or Date string)
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/api/movieslist", params={"city": city, "date": date})
            response.raise_for_status()
            data = response.json()
            trimmed = _trim_data(data, ["_id", "title", "language", "genre"], 10)
            return json.dumps(trimmed)
        except Exception as e:
            return f"Error fetching movies: {str(e)}"

async def get_theaters_by_city(city: str) -> str:
    """Gets theaters available in a specific city."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/api/theaterdatabycity", params={"city": city})
            response.raise_for_status()
            data = response.json()
            trimmed = _trim_data(data, ["_id", "name", "location"], 10)
            return json.dumps(trimmed)
        except Exception as e:
            return f"Error fetching theaters: {str(e)}"

async def check_seat_availability(theater_id: str, movie_id: str, screen_id: str, show_time: str) -> str:
    """
    Retrieves the seat map (booked and available seats) for a specific show.
    Args:
        theater_id: ID of the theater.
        movie_id: ID of the movie.
        screen_id: ID of the screen.
        show_time: Show time string.
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            params = {
                "theaterId": theater_id,
                "movieId": movie_id,
                "screenId": screen_id,
                "showTime": show_time
            }
            response = await client.get(f"{BACKEND_URL}/api/getdataatseatselection", params=params)
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list) and len(data) > 0 and "seats" in data[0]:
                seats = data[0]["seats"]
                available = [s["seatName"] for s in seats if not s.get("isBooked")]
                return f"Total available seats: {len(available)}. Some available seats: {', '.join(available[:15])}"
            return str(data)[:1000]
        except Exception as e:
            return f"Error fetching seats: {str(e)}"

async def get_movie_showtimes(city: str, movie_id: str, date: str) -> str:
    """
    Finds the theaters and exact show timings for a specific movie in a city on a specific date.
    Args:
        city: Name of the city (e.g. Pune, Mumbai).
        movie_id: ID of the movie.
        date: Date in string format (e.g. 2026-05-01 or Date string)
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/api/getmoviedetails", params={"city": city, "movieid": movie_id, "date": date})
            response.raise_for_status()
            data = response.json()
            return str(data)[:2000]
        except Exception as e:
            return f"Error fetching showtimes: {str(e)}"

# We can expose a list of tools for LangChain or Google GenAI SDK to consume.
agent_tools = [
    get_cities,
    get_movies_by_city_and_date,
    get_theaters_by_city,
    get_movie_showtimes,
    check_seat_availability
]
