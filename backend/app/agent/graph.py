from typing import Literal
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from app.agent.state import AgentState
from app.agent.tools import tools
import os

# --- 1. CONFIGURATION ---
SYSTEM_PROMPT = """You are a Senior Investment Analyst at a top-tier hedge fund. 
Your goal is to produce a comprehensive, data-driven "Investment Memorandum" for the requested asset.

**CRITICAL INSTRUCTION REGARDING OUTPUT FORMAT:**
You MUST return your ENTIRE final response as a valid JSON object. Do not wrap it in markdown block quotes.
The JSON object must contain exactly two keys:
- "score": An integer from 0 to 100 representing the overall market sentiment (0 = maximum bearish, 50 = neutral, 100 = maximum bullish).
- "markdown": The fully formatted markdown report text.

**STRUCTURE OF YOUR REPORT (in the "markdown" field):**
1.  **Executive Verdict:** (Bullish/Bearish/Neutral) + High conviction one-liner.
2.  **The Catalyst:** What specifically is driving the price right now? (Earnings, Macro, Product).
3.  **Financial Health:** Key metrics (P/E, Revenue Growth, Cash Flow) compared to peers.
4.  **Key Risks:** What could go wrong? (Geopolitics, Supply Chain, Valuation).
5.  **Forward Outlook:** A prediction for the next quarter.

**TONE & STYLE:**
* Be professional, concise, and decisive.
* Use financial terminology correctly (e.g., "YoY", "EBITDA", "Headwinds").
* Do NOT hedge your words ("it might go up"). Make a call based on the data.
* Format with clear Markdown headers (##), bolding (**), and bullet points.
"""

# --- 2. NODES ---

def agent_node(state: AgentState):
    """
    The Brain: Decides whether to call a tool or answer the user.
    """
    messages = state["messages"]
    api_key = state.get("api_key") or os.getenv("GOOGLE_API_KEY")
    
    # Instantiate the model dynamically per request
    dynamic_model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2, api_key=api_key)
    dynamic_model_with_tools = dynamic_model.bind_tools(tools)
    
    # Inject System Prompt if it's the first turn
    if not isinstance(messages[0], SystemMessage):
        messages.insert(0, SystemMessage(content=SYSTEM_PROMPT))
    
    response = dynamic_model_with_tools.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    """
    The Traffic Cop: Checks if the last message was a tool call.
    """
    messages = state["messages"]
    last_message = messages[-1]
    
    if last_message.tool_calls:
        return "tools"
    
    return "__end__"

# --- 3. GRAPH BUILD ---
workflow = StateGraph(AgentState)

workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools))

workflow.set_entry_point("agent")

workflow.add_conditional_edges(
    "agent",
    should_continue,
)
workflow.add_edge("tools", "agent")

app = workflow.compile()