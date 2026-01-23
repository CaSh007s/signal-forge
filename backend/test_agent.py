# backend/test_agent.py
import asyncio
from app.agent.graph import app_graph
from dotenv import load_dotenv

load_dotenv()

async def run_test():
    print("🚀 Initializing SignalForge Agent...")
    
    inputs = {"company": "Tesla", "ticker": "TSLA"}
    
    # We iterate over the steps to see the "Streaming" potential
    async for output in app_graph.astream(inputs):
        for key, value in output.items():
            print(f"✅ Node '{key}' finished.")
            if "messages" in value:
                print(f"   Log: {value['messages']}")
            if "report" in value:
                print("\n--- FINAL REPORT ---\n")
                print(value["report"][:500] + "...") # Print first 500 chars

if __name__ == "__main__":
    asyncio.run(run_test())