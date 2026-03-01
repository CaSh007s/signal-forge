import os
import warnings
import yfinance as yf
from dotenv import load_dotenv
from langchain_core.tools import tool

# 1. Force load environment variables immediately
load_dotenv()

# 2. Suppress the specific LangChain deprecation warning
warnings.filterwarnings("ignore", category=UserWarning, module="langchain")

# 3. Use the community import
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.tools import DuckDuckGoSearchRun

# Initialize Search Tools
tavily_tool = TavilySearchResults(max_results=3)
ddg_tool = DuckDuckGoSearchRun()

@tool
def fetch_stock_data(ticker: str):
    """
    Fetches historical stock data and current info using yfinance.
    Input should be a stock ticker symbol (e.g., AAPL, TSLA).
    """
    try:
        import requests
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        stock = yf.Ticker(ticker, session=session)
        hist = stock.history(period="1mo")
        
        if hist.empty:
            return {"error": "No stock data found"}

        start_price = hist["Close"].iloc[0]
        end_price = hist["Close"].iloc[-1]
        growth = ((end_price - start_price) / start_price) * 100

        return {
            "current_price": round(end_price, 2),
            "start_price_1mo": round(start_price, 2),
            "growth_1mo_percent": round(growth, 2),
            "currency": stock.info.get("currency", "USD")
        }
    except Exception as e:
        return {"error": str(e)}

@tool
def search_market_news(query: str):
    """
    Searches for recent market news about a company or topic.
    """
    try:
        # Use Tavily for high-quality news
        results = tavily_tool.invoke({"query": query})
        content = ""
        if isinstance(results, list):
            content = "\n".join([r.get("content", "") for r in results])
        else:
            content = str(results)
        return content
    except Exception as e:
        print(f"Tavily error: {e}. Fallback to DuckDuckGo...")
        return ddg_tool.invoke(query)

# Export the list of tools for the graph
tools = [fetch_stock_data, search_market_news]