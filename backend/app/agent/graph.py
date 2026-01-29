from typing import Literal
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from app.agent.state import AgentState
from app.agent.tools import tools
import os

# 1. Initialize the Model
if not os.getenv("GOOGLE_API_KEY"):
    print("⚠️ WARNING: GOOGLE_API_KEY not found in .env")

model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

# Bind the tools to the model
model_with_tools = model.bind_tools(tools)

# 2. Define the Nodes

def agent_node(state: AgentState):
    """
    The Brain: Decides whether to call a tool or answer the user.
    """
    messages = state["messages"]
    response = model_with_tools.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    """
    The Traffic Cop: Checks if the last message was a tool call.
    """
    messages = state["messages"]
    last_message = messages[-1]
    
    if last_message.tool_calls:
        return "tools"
    
    # Otherwise, stop
    return "__end__"

# 3. Build the Graph
workflow = StateGraph(AgentState)

# Define Nodes
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools))

# Define Edges
workflow.set_entry_point("agent")

workflow.add_conditional_edges(
    "agent",
    should_continue,
)
workflow.add_edge("tools", "agent")

# 4. Compile the Application
app = workflow.compile()