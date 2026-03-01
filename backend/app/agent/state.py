import operator
from typing import Annotated, List, TypedDict, Union
from langchain_core.messages import BaseMessage

class AgentState(TypedDict, total=False):
    messages: Annotated[List[BaseMessage], operator.add]
    company: str
    ticker: str
    stock_data: dict
    news_summary: str
    report: str
    api_key: str