import yfinance as yf
from datetime import datetime, timedelta

def get_stock_history(query: str):
    """
    Attempts to find a ticker from the query and returns 3mo daily data.
    """
    try:
        ticker_symbol = query.upper().strip()
        
        ticker = yf.Ticker(ticker_symbol)
        
        # Fetch 3 months of history
        hist = ticker.history(period="3mo")
        
        if hist.empty:
            return None

        data = []
        for date, row in hist.iterrows():
            data.append({
                "date": date.strftime('%Y-%m-%d'),
                "price": round(row['Close'], 2)
            })
            
        return {
            "symbol": ticker_symbol,
            "currency": ticker.info.get('currency', 'USD'),
            "history": data
        }

    except Exception as e:
        print(f"Error fetching stock data: {e}")
        return None