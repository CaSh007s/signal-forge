import operator
from typing import Annotated, List, TypedDict

class AgentState(TypedDict):
    company: str
    ticker: str
    stock_data: dict
    news_summary: str
    report: str
    messages: List[str]
