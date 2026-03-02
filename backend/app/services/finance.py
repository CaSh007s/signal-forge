import os
import requests
from datetime import datetime, timedelta

def get_conversion_rate(base: str, target: str) -> float:
    if base == target: return 1.0
    try:
        import yfinance as yf
        pair = f"{base}{target}=X"
        hist = yf.Ticker(pair).history(period="1d")
        if not hist.empty:
            return float(hist['Close'].iloc[-1])
    except Exception as e:
        print(f"Forex error {base}->{target}: {e}")
    return 1.0

def get_stock_history(query: str, target_currency: str = "USD"):
    """
    Attempts to find a ticker from the query and returns 3mo daily data from Alpaca/Yfinance,
    converting to the target_currency.
    """
    try:
        ticker_symbol = query.upper().strip()
        data = []
        base_currency = "USD"
        
        # 1. Global Market Fallback (yfinance)
        if "." in ticker_symbol:
            import yfinance as yf
            ticker = yf.Ticker(ticker_symbol)
            hist = ticker.history(period="3mo")
            
            if hist.empty:
                print(f"yfinance found no data for {ticker_symbol}")
                return None
                
            data = []
            for date, row in hist.iterrows():
                data.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "price": round(row['Close'], 2)
                })
                
            if ticker_symbol.endswith(".NS") or ticker_symbol.endswith(".BO"):
                base_currency = "INR"
            elif ticker_symbol.endswith(".L"):
                base_currency = "GBP"
            elif ticker_symbol.endswith(".TO"):
                base_currency = "CAD"
            
            # Data populated via yfinance

        else:
            # 2. US Market Default (Alpaca)
            api_key = os.getenv("ALPACA_API_KEY")
            secret_key = os.getenv("ALPACA_SECRET_KEY")
            
            if not api_key or not secret_key:
                print("Alpaca keys missing, returning None")
                return None

            headers = {
                "APCA-API-KEY-ID": api_key,
                "APCA-API-SECRET-KEY": secret_key,
                "Accept": "application/json"
            }

            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=90)
            
            start_str = start_dt.strftime('%Y-%m-%dT00:00:00Z')
            end_str = end_dt.strftime('%Y-%m-%dT23:59:59Z')

            url = f"https://data.alpaca.markets/v2/stocks/{ticker_symbol}/bars"
            params = {
                "timeframe": "1Day",
                "start": start_str,
                "end": end_str,
                "limit": 10000,
                "adjustment": "split",
                "feed": "iex"
            }

            res = requests.get(url, headers=headers, params=params)
            if res.status_code != 200:
                print("Alpaca Error:", res.text)
                return None
                
            json_data = res.json()
            bars = json_data.get("bars", [])
            
            if not bars:
                return None

            for bar in bars:
            # Alpaca timestamp looks like 2024-01-02T05:00:00Z
            bar_date = datetime.strptime(bar['t'][:10], '%Y-%m-%d').strftime('%Y-%m-%d')
            data.append({
                "date": bar_date,
                "price": round(bar['c'], 2)
            })

        # 3. Apply Multiplier
        rate = get_conversion_rate(base_currency, target_currency)
        if rate != 1.0:
            for item in data:
                item["price"] = round(item["price"] * rate, 2)
                
        return {
            "symbol": ticker_symbol,
            "currency": target_currency,
            "history": data
        }

    except Exception as e:
        print(f"Error fetching stock data from Alpaca: {e}")
        return None