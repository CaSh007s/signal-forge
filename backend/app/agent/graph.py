import os
from dotenv import load_dotenv

# 1. FORCE LOAD ENV before imports
load_dotenv()

from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from app.agent.state import AgentState
from app.agent.tools import fetch_stock_data, search_market_news

# 2. DEBUG: Check if key is loaded (Prints only first 5 chars for safety)
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("❌ CRITICAL: GOOGLE_API_KEY is missing!")
elif api_key.startswith("your_"):
    print("❌ CRITICAL: GOOGLE_API_KEY is still the placeholder!")
else:
    print(f"✅ Google API Key loaded: {api_key[:5]}...")

# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    google_api_key=api_key
)

# --- NODES ---

def get_financial_data(state: AgentState):
    """Node: Fetch stock data"""
    
    symbol = state.get("ticker") or state.get("company")
    data = fetch_stock_data(symbol)
    
    msg = f"Analyzed market data for {symbol}."
    if "error" in data:
        msg += f" (Warning: {data['error']})"
        
    return {
        "stock_data": data, 
        "messages": [msg]
    }

def get_news(state: AgentState):
    """Node: Search the web"""
    company = state["company"]
    news_content = search_market_news(company)
    return {
        "news_summary": news_content,
        "messages": [f"Gathered latest news regarding {company}."]
    }

def synthesize_report(state: AgentState):
    """Node: Generate the final markdown report using Gemini"""
    
    print("🤖 Generating report with Gemini...") # Debug print
    
    prompt = ChatPromptTemplate.from_template(
        """
        You are a Senior Investment Analyst at SignalForge.
        
        Analyze the following data for {company}:
        
        STOCK DATA:
        {stock_data}
        
        RECENT NEWS:
        {news_summary}
        
        Generate a professional Markdown investment report. 
        Structure strictly as follows:
        
        # Investment Outlook: {company}
        
        ## 1. Executive Summary
        (2-3 sentences max)
        
        ## 2. Market Sentiment & News
        (Analyze the news provided)
        
        ## 3. Financial Snapshot
        (Discuss the stock performance data provided)
        
        ## 4. Bull & Bear Case
        * **Bull Case:** (Why it might go up)
        * **Bear Case:** (Why it might go down)
        
        ## 5. Verdict
        (Short-term outlook: Buy/Hold/Sell - purely speculative based on data)
        """
    )
    
    chain = prompt | llm
    
    response = chain.invoke({
        "company": state["company"],
        "stock_data": str(state["stock_data"]),
        "news_summary": state["news_summary"]
    })
    
    return {
        "report": response.content,
        "messages": ["Report generated successfully."]
    }

#Graph Definition

workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("market_data", get_financial_data)
workflow.add_node("news_search", get_news)
workflow.add_node("analyst", synthesize_report)

# Define Edges
workflow.set_entry_point("market_data")
workflow.add_edge("market_data", "news_search")
workflow.add_edge("news_search", "analyst")
workflow.add_edge("analyst", END)

app_graph = workflow.compile()