import os
from dotenv import load_dotenv
import sys
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI

sys.stdout.reconfigure(encoding="utf-8")
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


@tool
def add_numbers(a: int, b: int) -> int:
    """ใช้เมื่อต้องการบวกเลขสองจำนวน"""
    return a + b


@tool
def get_weather(city: str) -> str:
    """ใช้เมื่อต้องการทราบสภาพอากาศของเมือง"""
    weather_data = {
        "bangkok": "32°C, sunny",
        "tokyo": "18°C, cloudy",
        "london": "12°C, rainy",
    }
    return weather_data.get(city.lower(), f"No weather data for {city}")


@tool
def search_knowledge(query: str) -> str:
    """ใช้ค้นหาความรู้เกี่ยวกับ Python และ AI"""
    knowledge = {
        "python": "Python is a programming language.",
        "llm": "LLM stands for Large Language Model.",
        "agent": "An AI agent can choose and use tools.",
    }

    for keyword, answer in knowledge.items():
        if keyword in query.lower():
            return answer

    return "No matching knowledge found."


model = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    api_key=os.getenv("GOOGLE_API_KEY"),
)

agent = create_agent(
    model=model,
    tools=[add_numbers, get_weather, search_knowledge],
    system_prompt=(
        "You are a helpful AI agent. "
        "Use tools when needed. "
        "You may call multiple tools if necessary. "
        "Answer in Thai."
    ),
)

result = agent.invoke({
    "messages": [
        {
            "role": "user",
            "content": "กรุงเทพอากาศเป็นยังไง แล้ว 25 + 17 ได้เท่าไหร่ ",
                
             
        }
    ]
})
print(result["messages"])


