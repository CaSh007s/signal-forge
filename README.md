<div align="center">
  <h1>Signal Forge</h1>
  
  <p>
    <strong>The Autonomous Market Research Agent</strong>
  </p>
  
  <p>
    <a href="https://signalforge-oo7s.vercel.app/">🔴 Live Demo</a> • 
    <a href="#gallery">📸 Gallery</a> • 
    <a href="#tech-stack">🛠 Tech Stack</a> •
    <a href="#author">👨‍💻 Author</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/AI-Gemini%202.5-4E8BF5?style=flat-square&logo=google" alt="Gemini" />
    <img src="https://img.shields.io/badge/Orchestration-LangGraph-FF4B4B?style=flat-square&logo=langchain" alt="LangGraph" />
    <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  </p>
</div>

<br />

<p align="center">
  <strong>Signal Forge</strong> is an AI-powered financial analyst that lives in your browser. 
  Unlike simple chatbots, it uses <strong>LangGraph</strong> to orchestrate a multi-step research workflow. 
  It autonomously plans, searches live news (Tavily), analyzes market data (yfinance), and generates 
  institutional-grade investment memorandums with clear "Bullish/Bearish" verdicts.
</p>

---

<h2 id="gallery">📸 Gallery</h2>

<h3 align="center">🖥️ Desktop Experience</h3>

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Landing Page</strong><br />
      <em>Clean, distraction-free entry point.</em><br />
      <img src="./screenshots/landing-desktop.png" width="100%" alt="Landing Page" />
    </td>
    <td align="center" width="50%">
      <strong>Secure Authentication</strong><br />
      <em>OAuth integration via Supabase Auth.</em><br />
      <img src="./screenshots/signin-desktop.png" width="100%" alt="Signin Page" />
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>The Agent at Work</strong><br />
      <em>Real-time logging of reasoning steps.</em><br />
      <img src="./screenshots/agent-thinking.png" width="100%" alt="Agent Thinking" />
    </td>
    <td align="center" width="50%">
      <strong>The Final Report</strong><br />
      <em>Complete memo with charts & verdict.</em><br />
      <img src="./screenshots/report-desktop.png" width="100%" alt="Report View" />
    </td>
  </tr>
</table>

<br />

<h3 align="center">📱 Mobile Experience</h3>
<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>Dashboard (Mobile)</strong><br />
      <img src="./screenshots/dashboard-mobile.png" width="100%" alt="Mobile Dashboard" />
    </td>
    <td align="center" width="50%">
      <strong>Settings (Mobile)</strong><br />
      <img src="./screenshots/settings-mobile.png" width="100%" alt="Mobile Settings" />
    </td>
  </tr>
</table>

---

<h2 id="features">✨ Key Features</h2>

<ul>
  <li><strong>🧠 Agentic Workflow:</strong> Powered by <strong>LangGraph</strong> & <strong>LangChain</strong> to handle complex reasoning loops.</li>
  <li><strong>🚀 High-Performance Caching:</strong> Uses <strong>Redis</strong> (optional) for efficient state management and caching.</li>
  <li><strong>📊 Live Market Data:</strong> Fetches real-time price history and technicals using <code>yfinance</code>.</li>
  <li><strong>🌍 Real-Time News:</strong> Scrapes and synthesizes the latest financial news via <strong>Tavily API</strong>.</li>
  <li><strong>🔐 Secure Auth:</strong> Complete OAuth 2.0 implementation with Supabase Auth.</li>
  <li><strong>💾 Persistent History:</strong> Autosaves every report to <strong>Supabase</strong> (PostgreSQL) via SQLAlchemy.</li>
  <li><strong>🎨 Responsive UI:</strong> A "Soft Dark Mode" interface built with Tailwind CSS, optimized for both desktop and mobile.</li>
</ul>

---

<h2 id="tech-stack">🛠 Tech Stack</h2>

<table align="center">
  <tr>
    <td align="center"><strong>Frontend</strong></td>
    <td align="center"><strong>Backend & AI</strong></td>
    <td align="center"><strong>Data & Infra</strong></td>
  </tr>
  <tr>
    <td>Next.js 14 (App Router)</td>
    <td>Python 3.11 (FastAPI)</td>
    <td>Supabase (PostgreSQL)</td>
  </tr>
  <tr>
    <td>TypeScript</td>
    <td>LangChain & LangGraph</td>
    <td>Supabase Auth</td>
  </tr>
  <tr>
    <td>Tailwind CSS</td>
    <td>Google Gemini 2.5 Flash</td>
    <td>Redis (Caching)</td>
  </tr>
  <tr>
    <td>Framer Motion</td>
    <td>Tavily Search API</td>
    <td>Vercel & Render</td>
  </tr>
</table>

---

<h2 id="author">👨‍💻 Author</h2>

<p align="center">
  <strong>Kalash Pratap Gaur</strong><br>
  <a href="https://github.com/CaSh007s">@CaSh007s</a>
</p>

<p align="center">
  Built with ❤️ using Google's GenAI Stack.
</p>
