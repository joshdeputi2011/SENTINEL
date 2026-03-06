SENTINEL 🛡️
AI Guardian Against Misinformation

Sentinel is a browser-based AI agent that verifies the truthfulness of claims, headlines, and social media posts using live web evidence and structured AI reasoning.

Built for AI Hackathons and rapid intelligence systems, Sentinel analyzes information through a multi-step verification pipeline and produces a transparent verdict with confidence scoring.

🌍 The Problem

In the modern information ecosystem:

Fake news spreads 6× faster than verified news

Social media amplifies misleading narratives

AI-generated misinformation is increasing

Users lack tools to verify claims instantly

People often share information before verifying it.

Sentinel aims to make truth verification simple, fast, and transparent.

🚀 The Solution

Sentinel is an AI-powered verification agent that analyzes a claim and determines whether it is:

✔ TRUE
✖ FALSE
⚠ MISLEADING
❓ UNVERIFIED

The system uses:

Live web evidence

Structured reasoning

Credibility scoring

to generate a trustworthy verdict.

🧠 Core Technologies
Groq API — The Brain

Sentinel uses LLaMA-3.3-70B hosted on Groq for reasoning.

Responsibilities:

Claim decomposition

Evidence reasoning

Cross-referencing sources

Final verdict synthesis

Groq acts as a high-speed AI analyst reading evidence and making judgments.

Tavily API — The Eyes

Tavily provides real-time web search results designed for AI.

It returns:

Web article titles

Source URLs

Snippets

AI-generated summary

This allows Sentinel to analyze live news data rather than outdated training data.

⚙️ Architecture

Sentinel runs entirely in the browser.

There is no traditional backend.

User Browser
     │
     ▼
React Frontend
     │
     ├── Tavily API → Live Web Evidence
     │
     └── Groq API → AI Reasoning Engine

Advantages:

Fast deployment

Serverless architecture

Scalable

Lightweight

🔬 Sentinel Verification Pipeline

Sentinel uses a structured 8-step reasoning pipeline.

1. Detect

Identify relevant countries, entities, or contexts in the claim.

2. Search

Tavily fetches live web evidence.

3. Decompose

The AI breaks the claim into verifiable sub-questions.

4. Tier 1 Analysis

Reasoning based on official/government sources.

5. Tier 2 Analysis

Reasoning based on verified news media.

6. Cross Reference

Find agreements and contradictions across sources.

7. Credibility Scoring

Apply mathematical weights to source credibility.

8. Synthesize

Generate the final verdict and confidence score.

📊 Credibility Scoring System

Sentinel applies weighted scoring to sources.

Source Tier	Type	Weight
Tier 1	Government / Official	1.0
Tier 2	Verified Press	0.8
Tier 3	Regional / Secondary	0.5

Confidence score formula:

weighted_support_ratio =
(sum of supporting source weights)
/
(total source weights)

This ensures high-quality sources influence the verdict more strongly.

📡 Key Features
Claim Monitor

Users can paste:

Tweets

WhatsApp forwards

News headlines

Social media posts

Sentinel extracts the core verifiable claim automatically.

Spread Indicator

Tracks how widely a claim is spreading across:

News media

Social platforms

Fact-checking sites

Forums and video platforms

Returns:

VIRAL

SPREADING

CIRCULATING

LIMITED

Counter-Narrative Panel

If a claim is false or misleading, Sentinel generates:

✖ The False Claim
✔ The Verified Truth

With supporting evidence.

Trust Score Card

Users can export a shareable Trust Card including:

Final verdict

Confidence score

Spread level

Verified sources

Counter narrative

Export format: HTML report

💻 Tech Stack

Frontend

React

TailwindCSS

AI

Groq API (LLaMA 3.3 70B)

Data

Tavily Search API

Deployment

Static web application

📈 Example Verification

Claim

"Iran launched a nuclear missile at Israel."

Sentinel performs:

Live search

Evidence extraction

Cross-source verification

Credibility scoring

Output

Verdict: FALSE
Confidence: 94%

Sources and reasoning are displayed transparently.

🌟 Use Cases

Sentinel can be used for:

Social media misinformation detection

Journalism verification tools

Research and academic fact-checking

Crisis information monitoring

Public information verification

🔮 Future Roadmap

Planned enhancements include:

Real-time social media monitoring

Browser extension

Mobile application

Multilingual verification

AI-powered misinformation alerts

👨‍💻 Built For

RUSH-A-THON 2026
Bionary Club — AI Agent Hackathon

🛡️ Sentinel

Truth should travel faster than misinformation.

Sentinel is designed to help build a safer and more trustworthy information ecosystem.
