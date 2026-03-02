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
from langchain_tavily import TavilySearchResults
from langchain_community.tools import DuckDuckGoSearchRun

# Initialize Search Tools
tavily_tool = TavilySearchResults(max_results=3)
ddg_tool = DuckDuckGoSearchRun()

@tool
def fetch_stock_data(ticker: str):
    """
    Fetches historical stock data and current info from Alpaca.
    Input should be a stock ticker symbol (e.g., AAPL, TSLA).
    """
    try:
        import requests
        from datetime import datetime, timedelta
        import os
        
        if "." in ticker:
            import yfinance as yf
            tick = yf.Ticker(ticker.upper())
            hist = tick.history(period="1mo")
            if hist.empty:
                return {"error": "No stock data found via international feed."}
                
            start_price = hist['Close'].iloc[0]
            end_price = hist['Close'].iloc[-1]
            growth = ((end_price - start_price) / start_price) * 100
            
            currency = "USD"
            if ticker.upper().endswith(".NS") or ticker.upper().endswith(".BO"):
                currency = "INR"
            elif ticker.upper().endswith(".L"):
                currency = "GBP"
            elif ticker.upper().endswith(".TO"):
                currency = "CAD"
                
            return {
                "current_price": round(end_price, 2),
                "start_price_1mo": round(start_price, 2),
                "growth_1mo_percent": round(growth, 2),
                "currency": currency
            }

        # 2. US Market Default (Alpaca)
        api_key = os.getenv("ALPACA_API_KEY")
        secret_key = os.getenv("ALPACA_SECRET_KEY")
        
        if not api_key or not secret_key:
            return {"error": "Alpaca API keys not configured on server"}

        headers = {
            "APCA-API-KEY-ID": api_key,
            "APCA-API-SECRET-KEY": secret_key,
            "Accept": "application/json"
        }

        # 1 month ago
        end_dt = datetime.utcnow()
        start_dt = end_dt - timedelta(days=30)
        
        url = f"https://data.alpaca.markets/v2/stocks/{ticker.upper()}/bars"
        params = {
            "timeframe": "1Day",
            "start": start_dt.strftime('%Y-%m-%dT00:00:00Z'),
            "end": end_dt.strftime('%Y-%m-%dT23:59:59Z'),
            "limit": 1000,
            "adjustment": "split",
            "feed": "iex"
        }

        res = requests.get(url, headers=headers, params=params)
        if res.status_code != 200:
            return {"error": f"Alpaca API error: {res.text}"}

        bars = res.json().get("bars", [])
        if not bars:
            return {"error": "No stock data found"}

        start_price = bars[0]['c']
        end_price = bars[-1]['c']
        growth = ((end_price - start_price) / start_price) * 100

        return {
            "current_price": round(end_price, 2),
            "start_price_1mo": round(start_price, 2),
            "growth_1mo_percent": round(growth, 2),
            "currency": "USD"
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