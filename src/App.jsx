import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE DATABASES
// ─────────────────────────────────────────────────────────────────────────────

// WAR / CONFLICT — Country-specific
const WAR_COUNTRY_SOURCES = {
  iran:      { tier1: ["IRNA", "Press TV", "Iranian Govt Portal", "Office of Supreme Leader"], tier2: ["Tasnim", "Mehr News", "Iran International"], keywords: ["iran","iranian","khamenei","tehran","irgc","revolutionary guard"] },
  india:     { tier1: ["PIB India", "MEA India", "Doordarshan", "ANI"], tier2: ["The Hindu", "Hindustan Times", "NDTV", "India Today"], keywords: ["india","indian","modi","delhi","kashmir","lok sabha"] },
  pakistan:  { tier1: ["APP Pakistan", "Radio Pakistan", "ISPR"], tier2: ["Dawn", "Geo News", "ARY News", "The News"], keywords: ["pakistan","pakistani","islamabad","karachi","lahore","isi"] },
  russia:    { tier1: ["TASS", "Russian MoD", "Kremlin", "Russian MFA"], tier2: ["RT", "Interfax", "RIA Novosti", "Meduza"], keywords: ["russia","russian","moscow","kremlin","putin","wagner","soviet"] },
  ukraine:   { tier1: ["Ukraine Govt Portal", "Ukrainian MFA", "General Staff UA"], tier2: ["Ukrinform", "Kyiv Independent", "Ukrainska Pravda"], keywords: ["ukraine","ukrainian","kyiv","zelensky","donbas","kherson"] },
  israel:    { tier1: ["IDF", "Israeli PM Office", "Israeli MFA", "Knesset"], tier2: ["Haaretz", "Times of Israel", "Ynet", "Jerusalem Post"], keywords: ["israel","israeli","netanyahu","idf","tel aviv","jerusalem","mossad","gaza","west bank"] },
  palestine: { tier1: ["WAFA", "Palestinian Authority", "UNRWA", "Hamas Official"], tier2: ["Al-Monitor", "Middle East Eye", "Electronic Intifada"], keywords: ["palestine","palestinian","hamas","gaza","ramallah","fatah","plo"] },
  usa:       { tier1: ["US State Dept", "Pentagon", "White House", "CIA Factbook"], tier2: ["NYT", "Washington Post", "NPR", "CNN"], keywords: ["united states","america","american","usa","washington","pentagon","nato ally"] },
  china:     { tier1: ["Xinhua", "People's Daily", "Chinese MFA", "CGTN"], tier2: ["Global Times", "SCMP", "Caixin"], keywords: ["china","chinese","beijing","xi jinping","pla","taiwan","hong kong","ccp"] },
  sudan:     { tier1: ["SUNA", "Sudanese Govt", "UN OCHA Sudan"], tier2: ["Radio Dabanga", "Sudan Tribune"], keywords: ["sudan","sudanese","khartoum","rsf","darfur","rapid support forces"] },
};

// GENERAL — Category-specific
const GENERAL_CATEGORY_SOURCES = {
  celebrity: {
    label: "Celebrity & Entertainment",
    icon: "🎬",
    tier1: ["Associated Press (AP)", "Reuters Entertainment", "PR Newswire", "Official Celebrity Reps"],
    tier2: ["Variety", "The Hollywood Reporter", "Entertainment Weekly", "People Magazine", "Deadline"],
    keywords: ["actor","actress","singer","celebrity","hollywood","oscar","grammy","emmy","kardashian","taylor swift","beyoncé","drake","rihanna","died","death","arrested","married","divorce","pregnant","affair"],
  },
  sports: {
    label: "Sports",
    icon: "🏆",
    tier1: ["Official League Sites (NFL/NBA/FIFA/ICC)", "AP Sports", "Reuters Sports", "Official Club Statements"],
    tier2: ["ESPN", "BBC Sport", "Sky Sports", "The Athletic", "Sports Illustrated", "Goal.com", "Cricinfo"],
    keywords: ["football","soccer","basketball","cricket","tennis","olympics","fifa","nfl","nba","ipl","premier league","champions league","world cup","transfer","injured","banned","doping","retired","ronaldo","messi","lebron"],
  },
  health: {
    label: "Health & Medicine",
    icon: "🏥",
    tier1: ["WHO", "CDC", "NIH", "The Lancet", "NEJM", "PubMed"],
    tier2: ["WebMD", "Healthline", "Medical News Today", "BBC Health", "NYT Health", "The Guardian Health"],
    keywords: ["vaccine","virus","cancer","cure","disease","drug","medicine","health","hospital","covid","pandemic","fda","approved","study","research","kills","causes","prevents","treatment"],
  },
  history: {
    label: "History & Education",
    icon: "📜",
    tier1: ["Britannica", "Smithsonian Institution", "Library of Congress", "National Archives", "UNESCO", "Oxford Academic"],
    tier2: ["History.com", "National Geographic History", "BBC History", "The Guardian History", "Academic journals"],
    keywords: ["history","historical","ancient","century","discovered","artifact","civilization","empire","president","king","queen","revolution","battle","treaty","invented","medieval","war of","was founded","was built"],
  },
  science: {
    label: "Science & Technology",
    icon: "🔬",
    tier1: ["NASA", "Nature", "Science Magazine", "CERN", "NIH", "NOAA", "ESA"],
    tier2: ["Scientific American", "New Scientist", "Ars Technica", "MIT Technology Review", "Wired", "The Verge"],
    keywords: ["science","technology","ai","artificial intelligence","space","planet","climate","discovered","research","study","experiment","proves","invention","breakthrough","quantum","robot","nasa","black hole","asteroid"],
  },
  politics: {
    label: "Politics & Government",
    icon: "🏛️",
    tier1: ["Official Govt Portals", "C-SPAN", "Congressional Record", "EU Official", "UN Official", "AP Politics"],
    tier2: ["Reuters", "BBC News", "The Guardian", "Politico", "The Hill", "NPR Politics", "Al Jazeera"],
    keywords: ["election","president","prime minister","congress","parliament","senator","vote","law","bill","policy","government","democrat","republican","conservative","liberal","corruption","impeach","resign","minister"],
  },
  business: {
    label: "Business & Finance",
    icon: "💹",
    tier1: ["SEC Filings (EDGAR)", "Bloomberg", "Reuters Business", "Financial Times", "Wall Street Journal", "Official Company Press Releases"],
    tier2: ["Forbes", "Business Insider", "CNBC", "The Economist", "Fortune", "TechCrunch", "Variety Business", "Hollywood Reporter Business"],
    keywords: [
      "stock","market","company","ceo","billion","million","bankrupt","merger","acquisition","ipo",
      "crypto","bitcoin","economy","recession","inflation","layoffs","fired","hired","acquiring","valuation",
      "takeover","buyout","deal","purchase","bought","buys","invest","revenue","profit","shares","stake",
      "warner","warner bros","warner brothers","hbo","discovery","wbd",
      "paramount","viacom","cbs","mtv","nickelodeon","pluto tv",
      "netflix","disney","hulu","espn","pixar","marvel studios",
      "apple tv","amazon prime","peacock","max","streaming",
      "sony pictures","universal pictures","mgm","lionsgate",
      "comcast","nbcuniversal","sky","viacomcbs",
      "fox","newscorp","news corp","twenty-first century fox",
      "spotify","tiktok","youtube","meta","google","microsoft","openai",
      "nvidia","amd","intel","qualcomm","arm","tsmc",
      "elon musk","zuckerberg","bezos","tim cook","satya nadella",
    ],
  },
  social: {
    label: "Social Media & Viral",
    icon: "📱",
    tier1: ["Reuters Fact Check", "AP Fact Check", "AFP Fact Check", "Snopes", "PolitiFact"],
    tier2: ["FactCheck.org", "Full Fact", "Lead Stories", "Check Your Fact", "USA Today Fact Check"],
    keywords: ["viral","trending","tweet","post","video","photo","fake","photoshopped","manipulated","out of context","misattributed","satire","meme","hoax","rumor","claim","shared","going around"],
  },
};

// WAR Global Tiers
const WAR_GLOBAL_TIERS = {
  1: { label: "TIER 1 — Official/Government", color: "#ff4444", weight: 1.0, sources: ["United Nations", "NATO", "WHO", "ICRC", "OCHA", "ICC", "US State Dept", "EU External Action"] },
  2: { label: "TIER 2 — Verified Press",      color: "#ff9100", weight: 0.8, sources: ["Reuters", "AP", "BBC", "Al Jazeera", "AFP", "The Guardian", "DW", "France 24"] },
  3: { label: "TIER 3 — Regional/Secondary",  color: "#ffd600", weight: 0.5, sources: ["Regional outlets", "Think tanks", "Expert analysts"] },
};

// GENERAL Global Tiers
const GENERAL_GLOBAL_TIERS = {
  1: { label: "TIER 1 — Primary Sources",      color: "#00e5ff", weight: 1.0, sources: ["Official statements", "Government records", "Peer-reviewed journals", "Wire services (AP/Reuters)"] },
  2: { label: "TIER 2 — Established Press",    color: "#7c4dff", weight: 0.8, sources: ["BBC", "NYT", "The Guardian", "Reuters", "AP", "AFP", "Al Jazeera"] },
  3: { label: "TIER 3 — Specialist/Secondary", color: "#00e676", weight: 0.5, sources: ["Industry publications", "Expert blogs", "Regional outlets"] },
};

const VERDICT_CONFIG = {
  TRUE:       { color: "#00e676", bg: "rgba(0,230,118,0.08)",  border: "rgba(0,230,118,0.3)",  icon: "✓", label: "VERIFIED TRUE"  },
  FALSE:      { color: "#ff1744", bg: "rgba(255,23,68,0.08)",  border: "rgba(255,23,68,0.3)",  icon: "✗", label: "FALSE"          },
  MISLEADING: { color: "#ff9100", bg: "rgba(255,145,0,0.08)",  border: "rgba(255,145,0,0.3)",  icon: "⚠", label: "MISLEADING"     },
  UNVERIFIED: { color: "#40c4ff", bg: "rgba(64,196,255,0.08)", border: "rgba(64,196,255,0.3)", icon: "?", label: "UNVERIFIED"     },
  PARTIAL:    { color: "#e040fb", bg: "rgba(224,64,251,0.08)", border: "rgba(224,64,251,0.3)", icon: "≈", label: "PARTIALLY TRUE" },
};

const WAR_SAMPLES = [
  "Russia destroyed 3 NATO supply depots inside Polish territory overnight",
  "Israel used chemical weapons in northern Gaza according to UN officials",
  "Did Iran's Supreme Leader Khamenei die?",
  "India and Pakistan exchange fire at Line of Control in Kashmir",
  "Sudan peace deal signed — all fighting has officially stopped",
];

const GENERAL_SAMPLES = [
  "Taylor Swift and Travis Kelce secretly got married in Las Vegas",
  "Cristiano Ronaldo announced retirement from professional football",
  "Scientists discovered a cure for Alzheimer's disease",
  "The Great Wall of China is visible from space with naked eye",
  "Apple is acquiring Netflix for $100 billion",
  "A famous actor was arrested for fraud at the Oscars",
];

const PIPELINE_STEPS = [
  { id: "detect",    icon: "🎯", label: "Detecting topic & context",      desc: "Identifying category, entities and source databases", duration: 1500 },
  { id: "search",    icon: "🔎", label: "Live web search",                desc: "Fetching real-time data from the internet",           duration: 4000 },
  { id: "decompose", icon: "🔬", label: "Decomposing claim",              desc: "Breaking into verifiable sub-questions",             duration: 2000 },
  { id: "tier1",     icon: "🏛️", label: "Querying primary sources",      desc: "Official records · Primary sources · Wire services",  duration: 3000 },
  { id: "tier2",     icon: "📰", label: "Querying secondary sources",    desc: "Established press · Specialist publications",         duration: 2500 },
  { id: "crossref",  icon: "⚖️", label: "Cross-referencing all sources", desc: "Finding agreements, contradictions, gaps",            duration: 2000 },
  { id: "scoring",   icon: "📊", label: "Computing credibility score",   desc: "Weighting findings by source tier",                   duration: 1200 },
  { id: "synthesize",icon: "🧠", label: "Synthesizing final verdict",    desc: "Reasoning across live data + all evidence",           duration: 2000 },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function safeArray(val) { return Array.isArray(val) ? val : []; }

function detectWarCountries(claim) {
  const lower = claim.toLowerCase();
  return Object.entries(WAR_COUNTRY_SOURCES)
    .filter(([, d]) => d.keywords.some(kw => lower.includes(kw)))
    .map(([country, d]) => ({ country, ...d }));
}

function detectGeneralCategory(claim) {
  const lower = claim.toLowerCase();
  // Priority order: business checked first to catch "Did X buy Y" / media M&A claims
  // before they fall through to the social/viral catch-all
  const PRIORITY_ORDER = ["business", "sports", "health", "science", "politics", "celebrity", "history", "social"];
  for (const key of PRIORITY_ORDER) {
    const data = GENERAL_CATEGORY_SOURCES[key];
    if (data && data.keywords.some(kw => lower.includes(kw))) return { key, ...data };
  }
  return { key: "social", ...GENERAL_CATEGORY_SOURCES.social };
}

// Get today's date string for injection into prompts and queries
function todayStr() {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Rewrite claim into "current status" form for Tavily so we always search for NOW
function toStatusQuery(claim) {
  const lower = claim.toLowerCase();
  // If already has temporal anchor, use as-is
  if (/\b(now|today|current|currently|still|latest|2024|2025|2026)\b/.test(lower)) return claim;
  // Strip question words and reframe as a current-status search
  const stripped = claim.replace(/^(did|does|is|are|was|were|has|have|do)\s+/i, "").replace(/\?$/, "").trim();
  return `current status ${stripped} ${new Date().getFullYear()}`;
}

async function tavilySearch(apiKey, query) {
  try {
    const statusQuery = toStatusQuery(query);
    // Run both: original query + "current status" variant in parallel
    const [res1, res2] = await Promise.all([
      fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: statusQuery,            // always ask "current status X 2026"
          search_depth: "advanced",
          max_results: 6,
          include_answer: true,
          include_raw_content: false,
          days: 90,                      // prioritise last 90 days
        }),
      }),
      fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: query,                  // original claim as backup
          search_depth: "basic",
          max_results: 4,
          include_answer: false,
          include_raw_content: false,
        }),
      }),
    ]);
    if (!res1.ok) return null;
    const d1 = await res1.json();
    const d2 = res2.ok ? await res2.json() : { results: [] };

    // Merge results — status query first (more recent), deduplicate by URL
    const seen = new Set();
    const merged = [...(d1.results || []), ...(d2.results || [])]
      .filter(r => { if (seen.has(r.url)) return false; seen.add(r.url); return true; })
      .slice(0, 10);

    return {
      answer: d1.answer || "",
      results: merged.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.content?.slice(0, 350),
        score: r.score,
        published_date: r.published_date || null,
      })),
    };
  } catch { return null; }
}

async function groqCall(apiKey, userPrompt, systemMsg) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemMsg || "You are SENTINEL, a misinformation analysis engine. Reply ONLY with valid JSON, no markdown, no backticks." },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `Groq error ${res.status}`); }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  const cleaned = raw.replace(/```json|```/g, "").replace(/,\s*([}\]])/g, "$1").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE: CLAIM MONITOR — extract claim from social text
// ─────────────────────────────────────────────────────────────────────────────
async function extractClaimFromText(groqKey, rawText) {
  return await groqCall(groqKey,
    `Extract the core factual claim from this social media post or article text. Return ONLY:
{"claim":"<the core verifiable factual claim in one clear sentence>","source_platform":"<twitter|reddit|facebook|whatsapp|news|unknown>","original_text":"<first 120 chars of input>"}

Input: "${rawText.slice(0, 600)}"`,
    "You are a claim extraction engine. Extract the single most important verifiable factual claim. Reply ONLY with valid JSON."
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE: SPREAD INDICATOR — parallel Tavily searches across platforms
// ─────────────────────────────────────────────────────────────────────────────
async function measureSpread(tavilyKey, claim) {
  if (!tavilyKey) return null;
  const platforms = [
    { name: "News Media",    query: `${claim} news article`, icon: "📰", color: "#00e5ff" },
    { name: "Social Media",  query: `${claim} twitter reddit viral`, icon: "📱", color: "#e040fb" },
    { name: "Fact Checkers", query: `${claim} fact check snopes politifact`, icon: "🔍", color: "#ffd600" },
    { name: "Video/Forums",  query: `${claim} youtube reddit discussion`, icon: "💬", color: "#ff9100" },
  ];
  try {
    const results = await Promise.all(
      platforms.map(async (p) => {
        try {
          const res = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: tavilyKey, query: p.query, search_depth: "basic", max_results: 5, include_answer: false, days: 30 }),
          });
          if (!res.ok) return { ...p, count: 0, results: [] };
          const data = await res.json();
          return {
            ...p,
            count: (data.results || []).length,
            results: (data.results || []).slice(0, 3).map(r => ({ title: r.title, url: r.url, snippet: r.content?.slice(0, 150), published_date: r.published_date || null })),
          };
        } catch { return { ...p, count: 0, results: [] }; }
      })
    );
    const totalHits = results.reduce((s, p) => s + p.count, 0);
    const spreadLevel = totalHits >= 15 ? "VIRAL" : totalHits >= 8 ? "SPREADING" : totalHits >= 3 ? "CIRCULATING" : "LIMITED";
    const spreadColor = spreadLevel === "VIRAL" ? "#ff1744" : spreadLevel === "SPREADING" ? "#ff9100" : spreadLevel === "CIRCULATING" ? "#ffd600" : "#4a5568";
    return { platforms: results, totalHits, spreadLevel, spreadColor };
  } catch { return null; }
}



// ─────────────────────────────────────────────────────────────────────────────
// SHARED PIPELINE CORE
// ─────────────────────────────────────────────────────────────────────────────
async function runSharedPipeline({ groqKey, tavilyKey, claim, onStep, mode, tier1Sources, tier2Sources, decomposePromptExtra, tier1System, tier2System, synthesizeSystem }) {
  // Step 2: Live search
  onStep("search", "active");
  await sleep(800);
  let liveSearchData = null, liveSnippets = "";
  if (tavilyKey) {
    liveSearchData = await tavilySearch(tavilyKey, claim);
    if (liveSearchData) {
      liveSnippets = `TODAY\'S DATE: ${todayStr()}\nLIVE WEB SEARCH RESULTS (most recent articles prioritised):\n` +
        (liveSearchData.answer ? `LIVE SUMMARY: ${liveSearchData.answer}\n\n` : "") +
        liveSearchData.results.map((r, i) =>
          `[${i+1}] ${r.title}${r.published_date ? ` (Published: ${r.published_date})` : ""} — ${r.url}\n"${r.snippet}"`
        ).join("\n\n");
    }
  }
  await sleep(PIPELINE_STEPS[1].duration - 800);
  onStep("search", "done", { found: liveSearchData?.results?.length || 0, hasLiveData: !!liveSearchData });

  // Step 3: Decompose
  onStep("decompose", "active");
  await sleep(PIPELINE_STEPS[2].duration);
  const decomposed = await groqCall(groqKey,
    `Decompose this claim into exactly 3 verifiable sub-questions:
Claim: "${claim}"
${decomposePromptExtra}
${liveSnippets ? `\nContext:\n${liveSnippets.slice(0,800)}` : ""}
Return ONLY: {"sub_questions":["<q1>","<q2>","<q3>"],"claim_type":"<type>","region":"<region or null>","key_actors":["<a1>","<a2>"],"entities":["<e>"],"key_claim":"<core assertion>"}`
  );
  onStep("decompose", "done", decomposed);

  // Step 4: Tier 1
  onStep("tier1", "active");
  await sleep(PIPELINE_STEPS[3].duration);
  const tier1 = await groqCall(groqKey,
    `Analyzing claim: "${claim}"\n${liveSnippets ? `LIVE DATA (primary evidence):\n${liveSnippets}\n\n` : ""}
Sub-questions: ${safeArray(decomposed.sub_questions).map((q,i)=>`${i+1}. ${q}`).join("\n")}
${tier1System}
Sources: ${tier1Sources.slice(0,10).join(", ")}
Return ONLY: {"findings":[{"source":"<n>","tier":1,"finding":"<1-2 sentences>","stance":"supports"|"contradicts"|"neutral"|"no_statement","sub_question_addressed":<1|2|3>}]}`
  );
  onStep("tier1", "done", tier1);

  // Step 5: Tier 2
  onStep("tier2", "active");
  await sleep(PIPELINE_STEPS[4].duration);
  const tier2 = await groqCall(groqKey,
    `Analyzing claim: "${claim}"\n${liveSnippets ? `LIVE DATA:\n${liveSnippets}\n\n` : ""}
Sub-questions: ${safeArray(decomposed.sub_questions).map((q,i)=>`${i+1}. ${q}`).join("\n")}
${tier2System}
Sources: ${tier2Sources.slice(0,10).join(", ")}
Return ONLY: {"findings":[{"source":"<n>","tier":2,"finding":"<1-2 sentences>","stance":"supports"|"contradicts"|"neutral"|"no_statement","sub_question_addressed":<1|2|3>}]}`
  );
  onStep("tier2", "done", tier2);

  // Step 6: Cross-ref
  onStep("crossref", "active");
  await sleep(PIPELINE_STEPS[5].duration);
  const allFindings = [...safeArray(tier1.findings), ...safeArray(tier2.findings)];
  const crossref = await groqCall(groqKey,
    `Cross-reference findings for claim: "${claim}"
Findings: ${allFindings.map((f,i)=>`[${i+1}] ${f.source} (T${f.tier}): "${f.finding}" — ${f.stance}`).join("\n")}
Return ONLY: {"agreements":["<a>"],"contradictions":[{"source_a":"<n>","source_b":"<n>","conflict":"<what>"}],"missing_information":["<g>"],"unresolved_questions":[<nums>],"source_consensus":"strong"|"moderate"|"weak"|"none","live_data_note":"<1 sentence>"}`
  );
  onStep("crossref", "done", crossref);

  // Step 7: Scoring
  onStep("scoring", "active");
  await sleep(PIPELINE_STEPS[6].duration);
  const getW = t => t===1?1.0:t===2?0.8:0.5;
  const wS = allFindings.filter(f=>f.stance==="supports").reduce((s,f)=>s+getW(f.tier),0);
  const wC = allFindings.filter(f=>f.stance==="contradicts").reduce((s,f)=>s+getW(f.tier),0);
  const wT = allFindings.reduce((s,f)=>s+getW(f.tier),0);
  const scoring = {
    total_sources: allFindings.length,
    supports: allFindings.filter(f=>f.stance==="supports").length,
    contradicts: allFindings.filter(f=>f.stance==="contradicts").length,
    neutral_or_silent: allFindings.filter(f=>f.stance==="neutral"||f.stance==="no_statement").length,
    weighted_support_ratio: wT>0?Math.round((wS/wT)*100):0,
    weighted_contradict_ratio: wT>0?Math.round((wC/wT)*100):0,
    tier1_count: allFindings.filter(f=>f.tier===1).length,
    tier2_count: allFindings.filter(f=>f.tier===2).length,
    live_results_found: liveSearchData?.results?.length||0,
  };
  onStep("scoring", "done", scoring);

  // Step 8: Synthesize
  onStep("synthesize", "active");
  await sleep(PIPELINE_STEPS[7].duration);
  const verdict = await groqCall(groqKey,
    `${synthesizeSystem}
CLAIM: "${claim}"
${liveSnippets ? `⚡ LIVE WEB DATA — THIS IS REAL, CURRENT INFORMATION FROM THE INTERNET TODAY. IT OVERRIDES YOUR TRAINING DATA COMPLETELY:\n${liveSnippets}\n\n` : "⚠ No live data — training only.\n\n"}
EVIDENCE: ${scoring.total_sources} sources · ${scoring.supports} support (${scoring.weighted_support_ratio}%) · ${scoring.contradicts} contradict (${scoring.weighted_contradict_ratio}%) · consensus: ${crossref.source_consensus||"none"}

TODAY\'S DATE: ${todayStr()}
The user is asking about the CURRENT state of affairs as of today. Even if the claim doesn\'t say "now" or "today", your verdict must reflect the CURRENT situation on ${todayStr()}.

CRITICAL RULES:
1. LIVE DATA > YOUR TRAINING. Always. No exceptions. Your training cutoff is months old.
2. The MOST RECENTLY PUBLISHED articles in the live data are the ground truth. Check published dates.
3. If a deal/event was announced but then CANCELLED or CHANGED, the LATEST article wins.
4. Your verdict must answer: "Is this claim TRUE as of TODAY (${todayStr()})?"
5. If live data shows the situation has CHANGED since the original event, reflect the current state.
6. If live data says Company A owns Company B RIGHT NOW, verdict = TRUE.
7. If live data says deal fell through / ownership changed, update verdict accordingly.
8. Set live_data_used to true whenever live snippets are present above.

Return ONLY: {"verdict":"TRUE"|"FALSE"|"MISLEADING"|"UNVERIFIED"|"PARTIAL","confidence":<0-100>,"summary":"<3-4 sentences — must state current status as of today, cite specific live sources and their dates>","key_finding":"<1 sentence stating the CURRENT status as of ${todayStr()}>","why_matters":"<1 sentence>","recommendation":"share_freely"|"verify_before_sharing"|"do_not_share"|"flag_as_false","live_data_used":<true|false>,"current_status":"<one phrase: e.g. \'Acquisition completed\' or \'Deal cancelled\' or \'Ownership transferred\'>"}`
  );
  onStep("synthesize", "done", verdict);

  // Spread measurement (non-blocking)
  let spreadData = null;
  if (tavilyKey) { try { spreadData = await measureSpread(tavilyKey, claim); } catch {} }

  // Counternarrative for FALSE/MISLEADING verdicts
  let counternarrative = null;
  if (tavilyKey && liveSnippets && (verdict.verdict === "FALSE" || verdict.verdict === "MISLEADING")) {
    try {
      counternarrative = await groqCall(groqKey,
        `Based on this live evidence, write the VERIFIED TRUE version of events that counters the false claim.
ORIGINAL CLAIM: "${claim}"
LIVE EVIDENCE: ${liveSnippets.slice(0, 1200)}
Return ONLY: {"true_version":"<2-3 sentences: what actually happened, citing specific sources>","key_difference":"<1 sentence: the main thing the claim got wrong>","verified_sources":["<source1>","<source2>","<source3>"]}`,
        "You are a counternarrative engine. Write accurate corrections backed by evidence. Reply ONLY with valid JSON."
      );
    } catch {}
  }

  return { decomposed, tier1, tier2, allFindings, crossref, scoring, verdict, liveSearchData, spreadData, counternarrative };
}

// ─────────────────────────────────────────────────────────────────────────────
// WAR PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
async function runWarPipeline(groqKey, tavilyKey, claim, onStep) {
  onStep("detect", "active");
  await sleep(PIPELINE_STEPS[0].duration);
  const detectedCountries = detectWarCountries(claim);
  onStep("detect", "done", { detected: detectedCountries.map(c => c.country), mode: "war" });

  const allTier1 = [...WAR_GLOBAL_TIERS[1].sources, ...detectedCountries.flatMap(c => c.tier1)];
  const allTier2 = [...WAR_GLOBAL_TIERS[2].sources, ...detectedCountries.flatMap(c => c.tier2)];

  const { decomposed, tier1, tier2, allFindings, crossref, scoring, verdict, liveSearchData, spreadData, counternarrative } = await runSharedPipeline({
    groqKey, tavilyKey, claim, onStep, mode: "war",
    tier1Sources: allTier1,
    tier2Sources: allTier2,
    decomposePromptExtra: `Context: This is a WAR/CONFLICT claim. Claim types: attack|death|ceasefire|casualty|territory|weapon|political|other`,
    tier1System: "For each Tier 1 OFFICIAL/GOVERNMENT/MILITARY source, state findings using live data as ground truth:",
    tier2System: "For each PRESS/MEDIA source, state findings prioritizing live data:",
    synthesizeSystem: "You are SENTINEL's final reasoning engine for WAR/CONFLICT claims.",
  });

  const safeDecomposed = { sub_questions: safeArray(decomposed.sub_questions), claim_type: decomposed.claim_type||"other", region: decomposed.region||null, key_actors: safeArray(decomposed.key_actors), entities: safeArray(decomposed.entities), key_claim: decomposed.key_claim||"" };
  const safeCrossref = { agreements: safeArray(crossref.agreements), contradictions: safeArray(crossref.contradictions), missing_information: safeArray(crossref.missing_information), unresolved_questions: safeArray(crossref.unresolved_questions), source_consensus: crossref.source_consensus||"none", live_data_note: crossref.live_data_note||"" };

  return {
    claim, mode: "war", category: null,
    decomposed: safeDecomposed, tier1Findings: safeArray(tier1.findings), tier2Findings: safeArray(tier2.findings),
    allFindings, crossref: safeCrossref, scoring,
    verdict: verdict.verdict||"UNVERIFIED", confidence: typeof verdict.confidence==="number"?verdict.confidence:50,
    summary: verdict.summary||"", key_finding: verdict.key_finding||"", why_matters: verdict.why_matters||"",
    current_status: verdict.current_status||"",
    recommendation: verdict.recommendation||"verify_before_sharing", live_data_used: !!verdict.live_data_used,
    liveSearchData, spreadData: spreadData||null, counternarrative: counternarrative||null,
    tags: detectedCountries.map(c=>c.country), timestamp: Date.now(),
    extraScoring: { country_sources_added: detectedCountries.flatMap(c=>[...c.tier1,...c.tier2]).length },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERAL PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
async function runGeneralPipeline(groqKey, tavilyKey, claim, onStep) {
  onStep("detect", "active");
  await sleep(PIPELINE_STEPS[0].duration);
  const category = detectGeneralCategory(claim);
  onStep("detect", "done", { detected: [category.label], mode: "general", categoryIcon: category.icon });

  const allTier1 = [...GENERAL_GLOBAL_TIERS[1].sources, ...category.tier1];
  const allTier2 = [...GENERAL_GLOBAL_TIERS[2].sources, ...category.tier2];

  const { decomposed, tier1, tier2, allFindings, crossref, scoring, verdict, liveSearchData, spreadData, counternarrative } = await runSharedPipeline({
    groqKey, tavilyKey, claim, onStep, mode: "general",
    tier1Sources: allTier1,
    tier2Sources: allTier2,
    decomposePromptExtra: `Context: This is a ${category.label.toUpperCase()} misinformation claim.`,
    tier1System: `For each PRIMARY/AUTHORITATIVE source, state what is known — use live data as ground truth:`,
    tier2System: `For each ESTABLISHED PRESS/SPECIALIST source, state findings:`,
    synthesizeSystem: `You are SENTINEL's final reasoning engine for ${category.label.toUpperCase()} misinformation.`,
  });

  const safeDecomposed = { sub_questions: safeArray(decomposed.sub_questions), claim_type: decomposed.claim_type||"other", region: decomposed.region||null, key_actors: safeArray(decomposed.key_actors), entities: safeArray(decomposed.entities), key_claim: decomposed.key_claim||"" };
  const safeCrossref = { agreements: safeArray(crossref.agreements), contradictions: safeArray(crossref.contradictions), missing_information: safeArray(crossref.missing_information), unresolved_questions: safeArray(crossref.unresolved_questions), source_consensus: crossref.source_consensus||"none", live_data_note: crossref.live_data_note||"" };
  const enrichedScoring = { ...scoring, category: category.label, category_icon: category.icon };

  return {
    claim, mode: "general", category,
    decomposed: safeDecomposed, tier1Findings: safeArray(tier1.findings), tier2Findings: safeArray(tier2.findings),
    allFindings, crossref: safeCrossref, scoring: enrichedScoring,
    verdict: verdict.verdict||"UNVERIFIED", confidence: typeof verdict.confidence==="number"?verdict.confidence:50,
    summary: verdict.summary||"", key_finding: verdict.key_finding||"", why_matters: verdict.why_matters||"",
    current_status: verdict.current_status||"",
    recommendation: verdict.recommendation||"verify_before_sharing", live_data_used: !!verdict.live_data_used,
    liveSearchData, spreadData: spreadData||null, counternarrative: counternarrative||null,
    tags: [category.label], timestamp: Date.now(), extraScoring: {},
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE: CLAIM MONITOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ClaimMonitor({ groqKey, onClaimExtracted }) {
  const [raw, setRaw] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  async function extract() {
    if (!raw.trim() || !groqKey) return;
    setExtracting(true); setError("");
    try {
      const result = await extractClaimFromText(groqKey, raw);
      if (result?.claim) { onClaimExtracted(result.claim); setRaw(""); setShow(false); }
      else setError("Could not extract a clear claim. Try pasting more context.");
    } catch(e) { setError(e.message); }
    finally { setExtracting(false); }
  }

  if (!show) return (
    <button onClick={() => setShow(true)} style={{ display:"flex",alignItems:"center",gap:10,background:"rgba(224,64,251,0.06)",border:"1px solid rgba(224,64,251,0.2)",borderRadius:12,padding:"12px 18px",cursor:"pointer",marginBottom:20,width:"100%",transition:"all 0.3s ease" }}
      onMouseEnter={e=>{e.currentTarget.style.background="rgba(224,64,251,0.1)";e.currentTarget.style.borderColor="rgba(224,64,251,0.4)";}}
      onMouseLeave={e=>{e.currentTarget.style.background="rgba(224,64,251,0.06)";e.currentTarget.style.borderColor="rgba(224,64,251,0.2)";}}>
      <div style={{ width:36,height:36,borderRadius:8,background:"rgba(224,64,251,0.15)",border:"1px solid rgba(224,64,251,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>📡</div>
      <div style={{ textAlign:"left",flex:1 }}>
        <div style={{ fontSize:12,color:"#e040fb",fontFamily:"'Orbitron', monospace",fontWeight:700,letterSpacing:2,marginBottom:2 }}>CLAIM MONITOR</div>
        <div style={{ fontSize:11,color:"#6B7280" }}>Paste a social media post, tweet, or article — SENTINEL auto-extracts the claim</div>
      </div>
      <span style={{ color:"#6B7280",fontSize:14,transition:"transform 0.3s ease" }}>▼</span>
    </button>
  );

  return (
    <div style={{ background:"linear-gradient(135deg, rgba(224,64,251,0.04) 0%, rgba(124,77,255,0.04) 100%)",border:"1px solid rgba(224,64,251,0.25)",borderRadius:16,padding:24,marginBottom:24 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:32,height:32,borderRadius:8,background:"rgba(224,64,251,0.15)",border:"1px solid rgba(224,64,251,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>📡</div>
          <div>
            <div style={{ fontSize:12,color:"#e040fb",fontFamily:"'Orbitron', monospace",fontWeight:700,letterSpacing:2 }}>CLAIM MONITOR</div>
            <div style={{ fontSize:10,color:"#6B7280" }}>Auto-extract verifiable claims from any content</div>
          </div>
        </div>
        <button onClick={() => setShow(false)} style={{ background:"transparent",border:"none",color:"#6B7280",cursor:"pointer",fontSize:18,lineHeight:1 }}>✕</button>
      </div>
      <div style={{ fontSize:12,color:"#6B7280",marginBottom:14,lineHeight:1.6 }}>
        Paste any social media post, news headline, WhatsApp forward, or tweet. SENTINEL will extract the core verifiable claim and auto-fill the investigation box.
      </div>
      <textarea value={raw} onChange={e=>setRaw(e.target.value)}
        placeholder={"Paste tweet, social post, or article text here...\n\nExample: \"BREAKING: Scientists confirmed coffee cures cancer. Share this!!\""} rows={4}
        style={{ width:"100%",background:"rgba(15,17,21,0.6)",border:"1px solid rgba(224,64,251,0.2)",borderRadius:10,padding:"14px 16px",color:"#e2e8f0",fontSize:14,lineHeight:1.6,resize:"none",fontFamily:"'Inter', sans-serif",outline:"none",marginBottom:12,transition:"all 0.3s ease" }} />
      {error && <div style={{ fontSize:11,color:"#ff1744",fontFamily:"monospace",marginBottom:10,padding:"8px 12px",background:"rgba(255,23,68,0.06)",borderRadius:6,border:"1px solid rgba(255,23,68,0.2)" }}>✗ {error}</div>}
      <button onClick={extract} disabled={!raw.trim()||extracting}
        style={{ background:raw.trim()&&!extracting?"linear-gradient(135deg,#e040fb,#7c4dff)":"rgba(31,41,55,0.6)",border:"none",borderRadius:10,color:"#fff",padding:"12px 24px",fontSize:13,fontWeight:700,cursor:raw.trim()&&!extracting?"pointer":"not-allowed",opacity:raw.trim()&&!extracting?1:0.5,fontFamily:"'Orbitron', monospace",letterSpacing:1,transition:"all 0.3s ease" }}>
        {extracting ? "⟳ EXTRACTING CLAIM..." : "📡 EXTRACT & INVESTIGATE →"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE: SPREAD INDICATOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function SpreadIndicator({ spreadData }) {
  const [expanded, setExpanded] = useState(false);
  if (!spreadData) return null;
  const { platforms, totalHits, spreadLevel, spreadColor } = spreadData;
  return (
    <div style={{ background:"linear-gradient(135deg, rgba(15,17,21,0.95) 0%, rgba(31,41,55,0.95) 100%)",border:`1px solid ${spreadColor}30`,borderRadius:12,padding:18,marginBottom:16 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer" }} onClick={()=>setExpanded(e=>!e)}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ background:`${spreadColor}15`,border:`1px solid ${spreadColor}40`,borderRadius:8,padding:"7px 14px" }}>
            <span style={{ fontSize:11,color:spreadColor,fontFamily:"'Orbitron', monospace",fontWeight:800,letterSpacing:2 }}>
              {spreadLevel==="VIRAL"?"🔥":spreadLevel==="SPREADING"?"📈":spreadLevel==="CIRCULATING"?"🔄":"📊"} {spreadLevel}
            </span>
          </div>
          <div>
            <div style={{ fontSize:12,color:"#e2e8f0",fontFamily:"'Orbitron', monospace",fontWeight:700,letterSpacing:1 }}>SPREAD INDICATOR</div>
            <div style={{ fontSize:11,color:"#6B7280",marginTop:2 }}>{totalHits} mentions across {platforms.filter(p=>p.count>0).length} platform types</div>
          </div>
        </div>
        <span style={{ color:"#6B7280",fontSize:14,transform:expanded?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.3s" }}>▼</span>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14 }}>
        {platforms.map(p=>(
          <div key={p.name} style={{ background:"rgba(15,17,21,0.6)",border:"1px solid rgba(31,41,55,0.8)",borderRadius:8,padding:"10px 12px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ fontSize:11,color:"#6B7280",fontFamily:"monospace" }}>{p.icon} {p.name}</span>
              <span style={{ fontSize:13,color:p.count>0?p.color:"#374151",fontFamily:"monospace",fontWeight:700 }}>{p.count}</span>
            </div>
            <div style={{ background:"rgba(31,41,55,0.8)",borderRadius:100,height:4,overflow:"hidden" }}>
              <div style={{ background:p.color,height:"100%",width:`${Math.min((p.count/5)*100,100)}%`,borderRadius:100,transition:"width 1s ease" }} />
            </div>
          </div>
        ))}
      </div>
      {expanded && platforms.filter(p=>p.results?.length>0).map(p=>(
        <div key={p.name} style={{ marginTop:14 }}>
          <div style={{ fontSize:10,color:p.color,fontFamily:"monospace",letterSpacing:2,marginBottom:8 }}>{p.icon} {p.name.toUpperCase()} — TOP HITS</div>
          {p.results.map((r,i)=>(
            <div key={i} style={{ background:"rgba(15,17,21,0.6)",border:"1px solid rgba(31,41,55,0.8)",borderRadius:8,padding:"10px 14px",marginBottom:6 }}>
              <div style={{ fontSize:11,color:"#22D3EE",fontFamily:"monospace",marginBottom:2 }}>{r.title?.slice(0,90)}{r.title?.length>90?"…":""}</div>
              {r.published_date && <div style={{ fontSize:10,color:"#374151",fontFamily:"monospace" }}>{r.published_date}</div>}
              <div style={{ fontSize:11,color:"#8892a4",marginTop:4,lineHeight:1.4 }}>{r.snippet?.slice(0,120)}{r.snippet?.length>120?"…":""}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE: COUNTERNARRATIVE PANEL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function CounternarrativePanel({ counternarrative, verdict }) {
  if (!counternarrative || (verdict !== "FALSE" && verdict !== "MISLEADING")) return null;
  const sources = Array.isArray(counternarrative.verified_sources) ? counternarrative.verified_sources : [];
  return (
    <div style={{ background:"linear-gradient(135deg, rgba(0,230,118,0.04) 0%, rgba(0,230,118,0.02) 100%)",border:"2px solid rgba(0,230,118,0.3)",borderRadius:12,padding:20,marginBottom:16 }}>
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
        <div style={{ width:34,height:34,borderRadius:"50%",background:"rgba(0,230,118,0.15)",border:"2px solid rgba(0,230,118,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>✓</div>
        <div>
          <div style={{ fontSize:12,color:"#00e676",fontFamily:"'Orbitron', monospace",fontWeight:700,letterSpacing:2 }}>VERIFIED COUNTERNARRATIVE</div>
          <div style={{ fontSize:11,color:"#6B7280",marginTop:2 }}>What actually happened — backed by verified sources</div>
        </div>
      </div>
      <div style={{ background:"rgba(0,230,118,0.06)",border:"1px solid rgba(0,230,118,0.2)",borderRadius:10,padding:16,marginBottom:12 }}>
        <div style={{ fontSize:10,color:"#00e676",fontFamily:"monospace",letterSpacing:2,marginBottom:8 }}>THE TRUTH</div>
        <div style={{ fontSize:14,color:"#e2e8f0",lineHeight:1.75 }}>{counternarrative.true_version}</div>
      </div>
      {counternarrative.key_difference && (
        <div style={{ background:"rgba(255,23,68,0.05)",border:"1px solid rgba(255,23,68,0.2)",borderRadius:10,padding:14,marginBottom:12 }}>
          <div style={{ fontSize:10,color:"#ff1744",fontFamily:"monospace",letterSpacing:2,marginBottom:6 }}>WHAT THE CLAIM GOT WRONG</div>
          <div style={{ fontSize:13,color:"#8892a4",lineHeight:1.6 }}>{counternarrative.key_difference}</div>
        </div>
      )}
      {sources.length>0 && (
        <div>
          <div style={{ fontSize:10,color:"#6B7280",fontFamily:"monospace",letterSpacing:2,marginBottom:8 }}>VERIFIED BY</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
            {sources.map((s,i)=><span key={i} style={{ fontSize:11,color:"#00e676",fontFamily:"monospace",background:"rgba(0,230,118,0.08)",border:"1px solid rgba(0,230,118,0.2)",borderRadius:4,padding:"3px 10px" }}>✓ {s}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE: TRUST SCORE CARD — exportable HTML verdict card
// ─────────────────────────────────────────────────────────────────────────────
function TrustScoreCard({ result }) {
  const [generating, setGenerating] = useState(false);
  const cfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.UNVERIFIED;
  const recColors = { share_freely:"#00e676", verify_before_sharing:"#ffd600", do_not_share:"#ff9100", flag_as_false:"#ff1744" };
  const recLabels = { share_freely:"✓ Safe to share", verify_before_sharing:"⚠ Verify before sharing", do_not_share:"✗ Do not share", flag_as_false:"🚩 Flag as false" };

  function generateCard() {
    setGenerating(true);
    const recColor = recColors[result.recommendation] || "#4a5568";
    const recLabel = recLabels[result.recommendation] || result.recommendation;
    const dateStr = new Date(result.timestamp).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    const spreadInfo = result.spreadData ? `<div style="margin-top:12px;padding:10px 14px;background:${result.spreadData.spreadColor}15;border:1px solid ${result.spreadData.spreadColor}40;border-radius:6px;font-family:monospace;font-size:12px;color:${result.spreadData.spreadColor}">📡 SPREAD: ${result.spreadData.spreadLevel} — ${result.spreadData.totalHits} mentions detected</div>` : "";
    const counterInfo = result.counternarrative ? `<div style="margin-top:12px;padding:14px;background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.3);border-radius:8px"><div style="font-family:monospace;font-size:10px;color:#00e676;letter-spacing:2px;margin-bottom:8px">✓ THE TRUTH</div><div style="font-size:13px;color:#e2e8f0;line-height:1.6">${result.counternarrative.true_version||""}</div></div>` : "";
    const sources = (result.allFindings||[]).filter(f=>f.stance==="supports").slice(0,4).map(f=>`<span style="font-size:10px;color:#00e676;background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.2);border-radius:3px;padding:2px 7px;margin:2px;display:inline-block;font-family:monospace">✓ ${f.source}</span>`).join("");
    const isWar = result.mode === "war";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SENTINEL Trust Score Card</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0F1115;font-family:'Segoe UI',system-ui,sans-serif;padding:40px;display:flex;justify-content:center;align-items:center;min-height:100vh}.card{width:620px;background:#111827;border:2px solid ${cfg.border};border-radius:16px;overflow:hidden}</style></head><body>
<div class="card">
  <div style="background:${isWar?"rgba(255,23,68,0.08)":"rgba(79,70,229,0.08)"};padding:14px 24px;border-bottom:1px solid ${cfg.border};display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,#4F46E5,#22D3EE);display:flex;align-items:center;justify-content:center;font-size:18px">⚡</div>
      <div><div style="font-weight:800;font-size:14px;letter-spacing:4px;color:#e2e8f0;font-family:monospace">SENTINEL</div><div style="font-size:9px;color:#6B7280;font-family:monospace;letter-spacing:2px">UNIVERSAL TRUST FRAMEWORK</div></div>
    </div>
    <div style="font-size:10px;color:#6B7280;font-family:monospace">📅 ${dateStr}</div>
  </div>
  <div style="padding:26px">
    <div style="font-size:13px;color:#8892a4;font-style:italic;margin-bottom:20px;line-height:1.5;padding:14px 18px;background:rgba(15,17,21,0.8);border-radius:10px;border-left:3px solid ${cfg.color}">"${result.claim}"</div>
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
      <div style="background:${cfg.bg};border:2px solid ${cfg.border};border-radius:12px;padding:16px 22px;text-align:center;flex-shrink:0">
        <div style="font-size:30px;color:${cfg.color}">${cfg.icon}</div>
        <div style="font-size:10px;color:${cfg.color};font-family:monospace;font-weight:700;letter-spacing:2px;margin-top:6px">${cfg.label}</div>
      </div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:10px;color:#6B7280;font-family:monospace">CONFIDENCE</span><span style="font-size:12px;color:${cfg.color};font-family:monospace;font-weight:700">${result.confidence}%</span></div>
        <div style="background:#1F2937;border-radius:100px;height:8px;overflow:hidden"><div style="background:${cfg.color};height:100%;width:${result.confidence}%;border-radius:100px"></div></div>
        <div style="margin-top:10px;font-size:12px;color:#8892a4;line-height:1.5">${result.key_finding}</div>
      </div>
    </div>
    ${result.current_status?`<div style="display:inline-flex;align-items:center;gap:8px;background:${cfg.color}12;border:1px solid ${cfg.color}35;border-radius:6px;padding:6px 14px;margin-bottom:16px"><span style="font-size:9px;color:#6B7280;font-family:monospace">CURRENT STATUS</span><span style="font-size:11px;color:${cfg.color};font-family:monospace;font-weight:700">${result.current_status.toUpperCase()}</span></div>`:""}
    <div style="font-size:13px;color:#8892a4;line-height:1.7;margin-bottom:18px">${result.summary}</div>
    ${spreadInfo}${counterInfo}
    ${sources?`<div style="margin-top:14px"><div style="font-size:10px;color:#6B7280;font-family:monospace;letter-spacing:2px;margin-bottom:8px">VERIFIED BY</div>${sources}</div>`:""}
    <div style="margin-top:20px;padding:12px 18px;border:1px solid ${recColor}40;border-radius:8px;display:inline-flex;align-items:center;gap:10px">
      <span style="font-size:10px;color:#6B7280;font-family:monospace">RECOMMENDATION:</span>
      <span style="font-size:12px;color:${recColor};font-family:monospace;font-weight:700">${recLabel}</span>
    </div>
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid #1F2937;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      ${result.live_data_used?'<span style="font-size:10px;color:#00e676;font-family:monospace;background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.2);border-radius:4px;padding:3px 10px">⚡ VERIFIED WITH LIVE DATA</span>':""}
      <span style="font-size:10px;color:#374151;font-family:monospace">${result.scoring?.total_sources||0} sources · ${result.scoring?.tier1_count||0} primary · ${result.scoring?.tier2_count||0} press</span>
      <span style="margin-left:auto;font-size:10px;color:#1F2937;font-family:monospace">sentinel.ai</span>
    </div>
  </div>
</div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sentinel-trust-card-${Date.now()}.html`; a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setGenerating(false), 1000);
  }

  return (
    <button onClick={generateCard} disabled={generating}
      style={{ display:"flex",alignItems:"center",gap:8,background:"rgba(79,70,229,0.06)",border:"1px solid rgba(79,70,229,0.2)",borderRadius:8,padding:"8px 16px",cursor:generating?"not-allowed":"pointer",opacity:generating?0.6:1,transition:"all 0.2s",marginTop:4 }}
      onMouseEnter={e=>{e.currentTarget.style.background="rgba(79,70,229,0.14)";e.currentTarget.style.borderColor="rgba(79,70,229,0.5)";}}
      onMouseLeave={e=>{e.currentTarget.style.background="rgba(79,70,229,0.06)";e.currentTarget.style.borderColor="rgba(79,70,229,0.2)";}}>
      <span style={{ fontSize:14 }}>📄</span>
      <span style={{ fontSize:11,color:"#4F46E5",fontFamily:"'Orbitron', monospace",fontWeight:700,letterSpacing:1 }}>{generating?"GENERATING...":"EXPORT TRUST CARD"}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE PROGRESS UI - HORIZONTAL TIMELINE
// ─────────────────────────────────────────────────────────────────────────────
function PipelineProgress({ steps, stepData, mode }) {
  const accent = mode === "war" ? "#FF1744" : "#4F46E5";
  const accentGlow = mode === "war" ? "rgba(255, 23, 68, 0.4)" : "rgba(79, 70, 229, 0.4)";
  
  return (
    <div style={{ 
      background: "linear-gradient(135deg, rgba(15, 17, 21, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)", 
      border: `1px solid ${mode === "war" ? "rgba(255, 23, 68, 0.3)" : "rgba(79, 70, 229, 0.3)"}`, 
      borderRadius: 20, 
      padding: 32, 
      marginBottom: 40,
      boxShadow: `0 8px 32px ${accentGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
      backdropFilter: "blur(12px)"
    }}>
      <div style={{ 
        fontSize: 13, 
        color: accent, 
        fontFamily: "'Orbitron', monospace", 
        letterSpacing: 3, 
        marginBottom: 8,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 12
      }}>
        {mode === "war" ? "⚔️ WAR ROOM" : "🔍 SENTINEL"} INVESTIGATION
      </div>
      
      <div style={{ 
        fontSize: 11, 
        color: "#6B7280", 
        fontFamily: "'Inter', monospace",
        marginBottom: 32,
        letterSpacing: 1
      }}>
        Multi-layer verification pipeline in progress...
      </div>
      
      {/* HORIZONTAL TIMELINE */}
      <div style={{ position: "relative" }}>
        {/* Progress line */}
        <div style={{ 
          position: "absolute",
          top: 32,
          left: 48,
          right: 48,
          height: 3,
          background: "rgba(79, 70, 229, 0.1)",
          borderRadius: 100
        }}>
          {/* Active progress */}
          <div style={{
            height: "100%",
            background: `linear-gradient(90deg, ${accent}, ${mode === "war" ? "#FF9100" : "#22D3EE"})`,
            borderRadius: 100,
            width: `${(Object.values(steps).filter(s => s === "done").length / PIPELINE_STEPS.length) * 100}%`,
            transition: "width 0.5s ease",
            boxShadow: `0 0 12px ${accentGlow}`
          }} />
        </div>
        
        {/* Steps */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          position: "relative"
        }}>
          {PIPELINE_STEPS.map((step, i) => {
            const state = steps[step.id] || "waiting";
            const color = state === "done" ? "#00E676" : state === "active" ? accent : "#374151";
            const data = stepData[step.id];
            
            return (
              <div 
                key={step.id} 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center",
                  maxWidth: 120,
                  position: "relative",
                  zIndex: 1
                }}
              >
                {/* Step icon/number */}
                <div style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: "50%", 
                  border: `3px solid ${color}`, 
                  background: state === "active" 
                    ? `radial-gradient(circle, ${color}15, rgba(15, 17, 21, 0.9))` 
                    : "rgba(15, 17, 21, 0.9)",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  marginBottom: 12,
                  transition: "all 0.3s ease",
                  boxShadow: state === "active" 
                    ? `0 0 24px ${accentGlow}, 0 4px 12px rgba(0, 0, 0, 0.3)` 
                    : state === "done"
                    ? "0 0 16px rgba(0, 230, 118, 0.3)"
                    : "none",
                  position: "relative"
                }}>
                  {state === "done" && (
                    <span style={{ 
                      color: "#00E676", 
                      fontSize: 24,
                      fontWeight: 700
                    }}>
                      ✓
                    </span>
                  )}
                  {state === "active" && (
                    <>
                      <span style={{ 
                        fontSize: 28,
                        animation: "spin 2s linear infinite"
                      }}>
                        {step.icon}
                      </span>
                      {/* Scanning pulse rings */}
                      <div style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        border: `2px solid ${accent}`,
                        animation: "radar-ping 1.5s ease-out infinite",
                        opacity: 0.5
                      }} />
                    </>
                  )}
                  {state === "waiting" && (
                    <span style={{ 
                      color: "#374151", 
                      fontSize: 24,
                      fontFamily: "'Inter', monospace",
                      fontWeight: 700
                    }}>
                      {i + 1}
                    </span>
                  )}
                </div>
                
                {/* Step label */}
                <div style={{ 
                  fontSize: 11, 
                  color: state === "waiting" ? "#4a5568" : color,
                  fontFamily: "'Inter', monospace",
                  fontWeight: state === "active" ? 700 : 500,
                  textAlign: "center",
                  lineHeight: 1.4,
                  marginBottom: 8,
                  letterSpacing: 0.5
                }}>
                  {step.label.replace(step.icon, "").trim()}
                </div>
                
                {/* Progress data */}
                {state === "done" && data && (
                  <div style={{ 
                    fontSize: 9, 
                    color: "#6B7280",
                    fontFamily: "'Inter', monospace",
                    textAlign: "center",
                    background: "rgba(0, 230, 118, 0.05)",
                    border: "1px solid rgba(0, 230, 118, 0.2)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {step.id === "detect" && safeArray(data.detected).length > 0 && `${data.detected[0]}`}
                    {step.id === "search" && data.hasLiveData && `${data.found} live`}
                    {step.id === "decompose" && safeArray(data.sub_questions).length > 0 && `${data.sub_questions.length} questions`}
                    {(step.id === "tier1" || step.id === "tier2") && safeArray(data.findings).length > 0 && `${data.findings.length} findings`}
                    {step.id === "scoring" && `${data.total_sources} sources`}
                    {step.id === "synthesize" && "Complete"}
                    {step.id === "crossref" && "Done"}
                  </div>
                )}
                
                {state === "active" && (
                  <div style={{ 
                    fontSize: 9, 
                    color: accent,
                    fontFamily: "'Inter', monospace",
                    textAlign: "center",
                    animation: "pulse 2s infinite"
                  }}>
                    Processing...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INVESTIGATION REPORT
// ─────────────────────────────────────────────────────────────────────────────
function InvestigationReport({ result, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [activeTab, setActiveTab] = useState("verdict");

  const verdict        = result.verdict || "UNVERIFIED";
  const cfg            = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.UNVERIFIED;
  const confidence     = typeof result.confidence === "number" ? result.confidence : 50;
  const summary        = result.summary || "";
  const key_finding    = result.key_finding || "";
  const why_matters    = result.why_matters || "";
  const recommendation = result.recommendation || "verify_before_sharing";
  const live_data_used  = !!result.live_data_used;
  const current_status  = result.current_status || "";
  const scoring        = result.scoring || {};
  const decomposed     = result.decomposed || {};
  const sub_questions  = safeArray(decomposed.sub_questions);
  const crossref       = result.crossref || {};
  const agreements     = safeArray(crossref.agreements);
  const contradictions = safeArray(crossref.contradictions);
  const missing_info   = safeArray(crossref.missing_information);
  const unresolved     = safeArray(crossref.unresolved_questions);
  const allFindings    = safeArray(result.allFindings);
  const tags           = safeArray(result.tags);
  const liveSearchData  = result.liveSearchData || null;
  const spreadData      = result.spreadData || null;
  const counternarrative= result.counternarrative || null;
  const isWar           = result.mode === "war";
  const modeAccent     = isWar ? "#ff4444" : "#00e5ff";
  const tierInfo       = isWar ? WAR_GLOBAL_TIERS : GENERAL_GLOBAL_TIERS;

  const recColors = { share_freely: "#00e676", verify_before_sharing: "#ffd600", do_not_share: "#ff9100", flag_as_false: "#ff1744" };
  const recLabels = { share_freely: "✓ Safe to share", verify_before_sharing: "⚠ Verify before sharing", do_not_share: "✗ Do not share", flag_as_false: "🚩 Flag as false" };

  return (
    <div style={{ 
      background: "linear-gradient(135deg, rgba(15, 17, 21, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)", 
      border: `2px solid ${cfg.border}`, 
      borderRadius: 16, 
      marginBottom: 24, 
      overflow: "hidden",
      boxShadow: `0 8px 32px ${cfg.color}40, inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
      backdropFilter: "blur(12px)",
      position: "relative"
    }}>
      {/* Verdict glow effect */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "200px",
        background: `radial-gradient(circle at 50% 0%, ${cfg.color}15, transparent)`,
        pointerEvents: "none",
        opacity: 0.6
      }} />
      
      {/* Mode strip */}
      <div style={{ 
        background: isWar ? "rgba(255, 68, 68, 0.08)" : "rgba(79, 70, 229, 0.08)", 
        borderBottom: `1px solid ${modeAccent}30`, 
        padding: "10px 28px", 
        display: "flex", 
        alignItems: "center", 
        gap: 12,
        position: "relative",
        zIndex: 1
      }}>
        <span style={{ 
          fontSize: 11, 
          color: modeAccent, 
          fontFamily: "'Orbitron', monospace", 
          letterSpacing: 2.5, 
          fontWeight: 700
        }}>
          {isWar ? "⚔️ WAR ROOM" : `${result.category?.icon || "🔍"} ${(result.category?.label || "GENERAL").toUpperCase()}`}
        </span>
        <span style={{ 
          fontSize: 10, 
          color: "#4a5568", 
          fontFamily: "'Inter', monospace" 
        }}>
          · {new Date(result.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Header - Large Verdict Display */}
      <div 
        onClick={() => setExpanded(e => !e)} 
        style={{ 
          padding: "28px 32px", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "flex-start", 
          gap: 24, 
          borderBottom: expanded ? `1px solid ${cfg.border}50` : "none",
          position: "relative",
          zIndex: 1,
          transition: "all 0.3s ease"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(79, 70, 229, 0.03)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {/* Large Verdict Badge */}
        <div style={{ 
          background: `${cfg.bg}`, 
          border: `2px solid ${cfg.border}`, 
          borderRadius: 16, 
          padding: "20px 24px", 
          display: "flex", 
          alignItems: "center", 
          gap: 16, 
          flexShrink: 0,
          boxShadow: `0 4px 24px ${cfg.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
          minWidth: 220
        }}>
          <span style={{ fontSize: 42, textShadow: `0 0 20px ${cfg.color}` }}>
            {cfg.icon}
          </span>
          <div>
            <div style={{ 
              color: cfg.color, 
              fontFamily: "'Orbitron', monospace", 
              fontWeight: 800, 
              fontSize: 14, 
              letterSpacing: 2.5,
              marginBottom: 6
            }}>
              {cfg.label}
            </div>
            <div style={{ 
              color: cfg.color, 
              fontFamily: "'Inter', monospace", 
              fontSize: 13, 
              opacity: 0.8,
              fontWeight: 600
            }}>
              {confidence}% confidence
            </div>
          </div>
        </div>
        
        {/* Claim and Metadata */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: 15, 
            color: "#e2e8f0", 
            fontStyle: "italic", 
            lineHeight: 1.6, 
            marginBottom: 12,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500
          }}>
            "{result.claim}"
          </div>
          
          {/* Metadata badges */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{
              fontSize: 11,
              color: "#8892a4",
              fontFamily: "'Inter', monospace",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <span style={{ color: "#4F46E5" }}>📊</span>
              {scoring.total_sources || 0} sources
            </div>
            
            <span style={{ color: "#374151" }}>·</span>
            
            <div style={{
              fontSize: 11,
              color: "#8892a4",
              fontFamily: "'Inter', monospace",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <span style={{ color: "#00E676" }}>🏛️</span>
              {scoring.tier1_count || 0} primary
            </div>
            
            <span style={{ color: "#374151" }}>·</span>
            
            <div style={{
              fontSize: 11,
              color: "#8892a4",
              fontFamily: "'Inter', monospace",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <span style={{ color: "#40C4FF" }}>📰</span>
              {scoring.tier2_count || 0} press
            </div>
            
            {live_data_used && (
              <>
                <span style={{ color: "#374151" }}>·</span>
                <div style={{ 
                  fontSize: 10, 
                  color: "#00E676", 
                  fontFamily: "'Inter', monospace", 
                  background: "rgba(0, 230, 118, 0.1)", 
                  border: "1px solid rgba(0, 230, 118, 0.3)", 
                  borderRadius: 6, 
                  padding: "4px 10px",
                  fontWeight: 600,
                  letterSpacing: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  boxShadow: "0 0 12px rgba(0, 230, 118, 0.2)"
                }}>
                  ⚡ LIVE DATA
                </div>
              </>
            )}
            
            {tags.slice(0, 3).map(t => (
              <div 
                key={t} 
                style={{ 
                  fontSize: 10, 
                  color: modeAccent, 
                  fontFamily: "'Inter', monospace", 
                  background: `${modeAccent}15`, 
                  border: `1px solid ${modeAccent}40`, 
                  borderRadius: 6, 
                  padding: "4px 10px",
                  fontWeight: 600,
                  letterSpacing: 1
                }}
              >
                {t.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        
        {/* Expand/Collapse indicator + Trust Card export */}
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          {expanded && <TrustScoreCard result={result} />}
          <span style={{ color: "#6B7280", fontSize: 18, transition: "transform 0.3s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 24px 24px" }}>
          {/* Spread inline */}
          {spreadData && <SpreadIndicator spreadData={spreadData} />}
          {/* Counternarrative inline for FALSE/MISLEADING */}
          {counternarrative && (verdict === "FALSE" || verdict === "MISLEADING") && (
            <CounternarrativePanel counternarrative={counternarrative} verdict={verdict} />
          )}
          <div style={{ display: "flex", gap: 2, background: "#060b14", borderRadius: 6, padding: 3, margin: "18px 0" }}>
            {[["verdict","⚖️ Verdict"],["sources","📋 Sources"],["crossref","🔁 Cross-ref"],["live","⚡ Live"],["spread","📡 Spread"],["counter","✓ Counter"],["scoring","📊 Score"]].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: "7px 2px", borderRadius: 4, border: "none", cursor: "pointer", fontFamily: "monospace", fontSize: 10, letterSpacing: 0.5, background: activeTab === id ? "#1e2d40" : "transparent", color: activeTab === id ? "#e2e8f0" : "#4a5568" }}>{label}</button>
            ))}
          </div>

          {/* VERDICT */}
          {activeTab === "verdict" && (
            <div>
              <div style={{ background: live_data_used ? "rgba(0,230,118,0.05)" : "rgba(255,145,0,0.05)", border: `1px solid ${live_data_used ? "rgba(0,230,118,0.2)" : "rgba(255,145,0,0.2)"}`, borderRadius: 8, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span>{live_data_used ? "⚡" : "⚠️"}</span>
                <div style={{ fontSize: 12, color: live_data_used ? "#00e676" : "#ff9100", fontFamily: "monospace" }}>
                  {live_data_used ? "VERDICT BASED ON LIVE WEB DATA — not just training knowledge" : "No live search — verdict based on training data only."}
                </div>
              </div>
              {/* Current status + date stamp */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 6, padding: "6px 12px" }}>
                  <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "monospace" }}>📅 AS OF</span>
                  <span style={{ fontSize: 11, color: "#00e5ff", fontFamily: "monospace", fontWeight: 700 }}>{new Date(result.timestamp).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</span>
                </div>
                {current_status && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${cfg.color}10`, border: `1px solid ${cfg.color}35`, borderRadius: 6, padding: "6px 12px" }}>
                    <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "monospace" }}>CURRENT STATUS</span>
                    <span style={{ fontSize: 11, color: cfg.color, fontFamily: "monospace", fontWeight: 700 }}>{current_status.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div style={{ background: "#060b14", border: `1px solid ${cfg.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: cfg.color, fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>KEY FINDING — CURRENT STATUS AS OF TODAY</div>
                <div style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.6 }}>{key_finding}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#4a5568", fontFamily: "monospace" }}>CREDIBILITY-WEIGHTED CONFIDENCE</span>
                  <span style={{ fontSize: 13, color: cfg.color, fontFamily: "monospace", fontWeight: 700 }}>{confidence}%</span>
                </div>
                <div style={{ background: "#1a2030", borderRadius: 100, height: 10, overflow: "hidden" }}>
                  <div style={{ background: `linear-gradient(90deg,${cfg.color}88,${cfg.color})`, height: "100%", width: `${confidence}%`, borderRadius: 100, transition: "width 1.5s ease" }} />
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#8892a4", lineHeight: 1.8, marginBottom: 16 }}>{summary}</div>
              {sub_questions.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>SUB-QUESTIONS INVESTIGATED</div>
                  {sub_questions.map((q, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", background: "#060b14", borderRadius: 6, marginBottom: 6, alignItems: "flex-start" }}>
                      <span style={{ color: modeAccent, fontFamily: "monospace", fontSize: 11, flexShrink: 0 }}>Q{i+1}</span>
                      <span style={{ fontSize: 13, color: "#8892a4", flex: 1 }}>{q}</span>
                      {unresolved.includes(i+1) && <span style={{ fontSize: 9, color: "#ff1744", fontFamily: "monospace", background: "rgba(255,23,68,0.1)", border: "1px solid rgba(255,23,68,0.3)", borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>UNRESOLVED</span>}
                    </div>
                  ))}
                </div>
              )}
              {why_matters && (
                <div style={{ background: "rgba(255,145,0,0.06)", border: "1px solid rgba(255,145,0,0.2)", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#ff9100", fontFamily: "monospace", letterSpacing: 2, marginBottom: 6 }}>⚠ WHY THIS MATTERS</div>
                  <div style={{ fontSize: 13, color: "#8892a4", lineHeight: 1.6 }}>{why_matters}</div>
                </div>
              )}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${recColors[recommendation]||"#4a5568"}40`, borderRadius: 8, padding: "10px 16px", background: "rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "monospace" }}>RECOMMENDATION:</span>
                <span style={{ fontSize: 13, color: recColors[recommendation]||"#4a5568", fontFamily: "monospace", fontWeight: 700 }}>{recLabels[recommendation]||recommendation}</span>
              </div>
            </div>
          )}

          {/* SOURCES */}
          {activeTab === "sources" && (
            <div>
              {tags.length > 0 && (
                <div style={{ background: `${modeAccent}07`, border: `1px solid ${modeAccent}22`, borderRadius: 8, padding: "10px 16px", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: modeAccent, fontFamily: "monospace" }}>Sources activated for: {tags.join(", ")}</div>
                </div>
              )}
              {[1, 2].map(tier => {
                const findings = allFindings.filter(f => f.tier === tier);
                const ti = tierInfo[tier];
                return (
                  <div key={tier} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 3, height: 20, background: ti.color, borderRadius: 100 }} />
                      <span style={{ fontSize: 11, color: ti.color, fontFamily: "monospace" }}>{ti.label}</span>
                      <span style={{ fontSize: 10, color: "#4a5568", fontFamily: "monospace" }}>×{ti.weight} weight</span>
                    </div>
                    {findings.length === 0 && <div style={{ fontSize: 12, color: "#2d3748", fontFamily: "monospace", padding: "8px 0" }}>No findings.</div>}
                    {findings.map((f, i) => {
                      const sc = f.stance==="supports"?"#00e676":f.stance==="contradicts"?"#ff1744":f.stance==="neutral"?"#40c4ff":"#4a5568";
                      const si = f.stance==="supports"?"↑":f.stance==="contradicts"?"↓":f.stance==="neutral"?"→":"–";
                      return (
                        <div key={i} style={{ background: "#060b14", border: "1px solid #1a2030", borderRadius: 8, padding: "12px 16px", marginBottom: 8, display: "flex", gap: 12 }}>
                          <span style={{ color: sc, fontSize: 16, flexShrink: 0, marginTop: 2 }}>{si}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "monospace", fontWeight: 700 }}>{f.source}</span>
                              <span style={{ fontSize: 9, color: sc, fontFamily: "monospace", background: `${sc}15`, border: `1px solid ${sc}30`, borderRadius: 4, padding: "1px 5px" }}>{(f.stance||"").replace("_"," ").toUpperCase()}</span>
                              {f.sub_question_addressed && <span style={{ fontSize: 9, color: "#4a5568", fontFamily: "monospace" }}>Q{f.sub_question_addressed}</span>}
                            </div>
                            <div style={{ fontSize: 13, color: "#8892a4", lineHeight: 1.5 }}>{f.finding}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* CROSS-REF */}
          {activeTab === "crossref" && (
            <div>
              <div style={{ background: "#060b14", border: "1px solid #1e2d40", borderRadius: 8, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "monospace", letterSpacing: 2, marginBottom: 4 }}>SOURCE CONSENSUS</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", textTransform: "uppercase", color: crossref.source_consensus==="strong"?"#00e676":crossref.source_consensus==="moderate"?"#ffd600":"#ff1744" }}>{crossref.source_consensus||"none"}</div>
                </div>
                <div style={{ flex: 1, display: "flex", gap: 16, justifyContent: "flex-end" }}>
                  {[["↑",scoring.supports||0,"#00e676","Support"],["↓",scoring.contradicts||0,"#ff1744","Contradict"],["→",scoring.neutral_or_silent||0,"#40c4ff","Neutral"]].map(([ic,ct,cl,lb])=>(
                    <div key={lb} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, color: cl, fontWeight: 700 }}>{ct}</div>
                      <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "monospace" }}>{lb}</div>
                    </div>
                  ))}
                </div>
              </div>
              {crossref.live_data_note && <div style={{ background:"rgba(0,230,118,0.05)",border:"1px solid rgba(0,230,118,0.15)",borderRadius:8,padding:"10px 14px",marginBottom:14 }}><div style={{ fontSize:10,color:"#00e676",fontFamily:"monospace",letterSpacing:2,marginBottom:4 }}>⚡ LIVE DATA NOTE</div><div style={{ fontSize:13,color:"#8892a4" }}>{crossref.live_data_note}</div></div>}
              {agreements.length > 0 && <div style={{ marginBottom:14 }}><div style={{ fontSize:10,color:"#00e676",fontFamily:"monospace",letterSpacing:2,marginBottom:8 }}>✓ AGREEMENTS</div>{agreements.map((a,i)=><div key={i} style={{ padding:"8px 14px",background:"rgba(0,230,118,0.05)",border:"1px solid rgba(0,230,118,0.15)",borderRadius:6,marginBottom:6,fontSize:13,color:"#8892a4" }}>• {a}</div>)}</div>}
              {contradictions.length > 0 && <div style={{ marginBottom:14 }}><div style={{ fontSize:10,color:"#ff1744",fontFamily:"monospace",letterSpacing:2,marginBottom:8 }}>✗ CONTRADICTIONS</div>{contradictions.map((c,i)=><div key={i} style={{ padding:"10px 14px",background:"rgba(255,23,68,0.05)",border:"1px solid rgba(255,23,68,0.15)",borderRadius:6,marginBottom:6 }}><div style={{ fontSize:11,color:"#ff5555",fontFamily:"monospace",marginBottom:4 }}>{c.source_a} vs {c.source_b}</div><div style={{ fontSize:13,color:"#8892a4" }}>{c.conflict}</div></div>)}</div>}
              {missing_info.length > 0 && <div><div style={{ fontSize:10,color:"#ffd600",fontFamily:"monospace",letterSpacing:2,marginBottom:8 }}>? MISSING INFO</div>{missing_info.map((m,i)=><div key={i} style={{ padding:"8px 14px",background:"rgba(255,214,0,0.05)",border:"1px solid rgba(255,214,0,0.15)",borderRadius:6,marginBottom:6,fontSize:13,color:"#8892a4" }}>• {m}</div>)}</div>}
              {agreements.length===0&&contradictions.length===0&&missing_info.length===0&&<div style={{ fontSize:12,color:"#2d3748",fontFamily:"monospace",textAlign:"center",padding:"20px 0" }}>No cross-reference data.</div>}
            </div>
          )}

          {/* LIVE DATA */}
          {activeTab === "live" && (
            <div>
              {liveSearchData ? (
                <div>
                  {liveSearchData.answer && <div style={{ background:"rgba(0,230,118,0.05)",border:"1px solid rgba(0,230,118,0.2)",borderRadius:8,padding:16,marginBottom:16 }}><div style={{ fontSize:10,color:"#00e676",fontFamily:"monospace",letterSpacing:2,marginBottom:8 }}>⚡ LIVE SEARCH SUMMARY</div><div style={{ fontSize:14,color:"#e2e8f0",lineHeight:1.7 }}>{liveSearchData.answer}</div></div>}
                  <div style={{ fontSize:10,color:"#4a5568",fontFamily:"monospace",letterSpacing:2,marginBottom:12 }}>RAW RESULTS ({safeArray(liveSearchData.results).length})</div>
                  {safeArray(liveSearchData.results).map((r,i)=><div key={i} style={{ background:"#060b14",border:"1px solid #1a2030",borderRadius:8,padding:"12px 16px",marginBottom:8 }}><div style={{ fontSize:12,color:"#40c4ff",fontFamily:"monospace",marginBottom:4 }}>{r.title}</div><div style={{ fontSize:11,color:"#2d3748",fontFamily:"monospace",marginBottom:6 }}>{r.url}</div><div style={{ fontSize:13,color:"#8892a4",lineHeight:1.5 }}>{r.snippet}</div></div>)}
                </div>
              ) : (
                <div style={{ textAlign:"center",padding:"40px 20px",border:"1px dashed #1a2030",borderRadius:8,color:"#4a5568",fontFamily:"monospace",fontSize:12,lineHeight:2 }}>
                  ⚡ No live data — add <span style={{ color:"#ff9100" }}>VITE_TAVILY_API_KEY</span> to .env
                </div>
              )}
            </div>
          )}

          {/* SPREAD */}
          {activeTab === "spread" && (
            <div>
              {spreadData ? (
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:20 }}>
                    <div style={{ background:`${spreadData.spreadColor}15`,border:`1px solid ${spreadData.spreadColor}40`,borderRadius:10,padding:"12px 20px" }}>
                      <div style={{ fontSize:10,color:"#6B7280",fontFamily:"monospace",marginBottom:4,letterSpacing:2 }}>SPREAD LEVEL</div>
                      <div style={{ fontSize:22,color:spreadData.spreadColor,fontFamily:"'Orbitron', monospace",fontWeight:800 }}>
                        {spreadData.spreadLevel==="VIRAL"?"🔥":spreadData.spreadLevel==="SPREADING"?"📈":"🔄"} {spreadData.spreadLevel}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:28,color:"#e2e8f0",fontFamily:"monospace",fontWeight:800 }}>{spreadData.totalHits}</div>
                      <div style={{ fontSize:11,color:"#6B7280",fontFamily:"monospace" }}>total mentions detected</div>
                    </div>
                  </div>
                  {spreadData.platforms.map(p=>(
                    <div key={p.name} style={{ marginBottom:18 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                        <span style={{ fontSize:11,color:p.color,fontFamily:"monospace" }}>{p.icon} {p.name}</span>
                        <span style={{ fontSize:12,color:p.count>0?p.color:"#374151",fontFamily:"monospace",fontWeight:700 }}>{p.count} hits</span>
                      </div>
                      <div style={{ background:"rgba(31,41,55,0.8)",borderRadius:100,height:6,overflow:"hidden",marginBottom:8 }}>
                        <div style={{ background:p.color,height:"100%",width:`${Math.min((p.count/5)*100,100)}%`,borderRadius:100,transition:"width 1.2s ease" }} />
                      </div>
                      {p.results?.slice(0,2).map((r,i)=>(
                        <div key={i} style={{ background:"rgba(15,17,21,0.6)",border:"1px solid rgba(31,41,55,0.8)",borderRadius:8,padding:"10px 14px",marginBottom:4 }}>
                          <div style={{ fontSize:11,color:"#22D3EE",fontFamily:"monospace",marginBottom:2 }}>{r.title?.slice(0,90)}{r.title?.length>90?"…":""}</div>
                          {r.published_date && <span style={{ fontSize:10,color:"#374151",fontFamily:"monospace" }}>{r.published_date}</span>}
                          <div style={{ fontSize:11,color:"#8892a4",marginTop:4 }}>{r.snippet?.slice(0,120)}{r.snippet?.length>120?"…":""}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:"center",padding:"40px 20px",border:"1px dashed rgba(31,41,55,0.8)",borderRadius:10,color:"#6B7280",fontFamily:"monospace",fontSize:12,lineHeight:2 }}>
                  📡 Spread data requires Tavily API key<br/>Add <span style={{ color:"#ff9100" }}>VITE_TAVILY_API_KEY</span> to .env
                </div>
              )}
            </div>
          )}

          {/* COUNTERNARRATIVE */}
          {activeTab === "counter" && (
            <div>
              {counternarrative && (verdict === "FALSE" || verdict === "MISLEADING") ? (
                <div>
                  <div style={{ background:"rgba(0,230,118,0.05)",border:"2px solid rgba(0,230,118,0.3)",borderRadius:12,padding:22,marginBottom:18 }}>
                    <div style={{ fontSize:11,color:"#00e676",fontFamily:"'Orbitron', monospace",fontWeight:700,letterSpacing:2,marginBottom:14 }}>✓ WHAT ACTUALLY HAPPENED</div>
                    <div style={{ fontSize:14,color:"#e2e8f0",lineHeight:1.8,marginBottom:16 }}>{counternarrative.true_version}</div>
                    {counternarrative.key_difference && (
                      <div style={{ background:"rgba(255,23,68,0.06)",border:"1px solid rgba(255,23,68,0.2)",borderRadius:8,padding:14,marginBottom:14 }}>
                        <div style={{ fontSize:10,color:"#ff1744",fontFamily:"monospace",letterSpacing:2,marginBottom:6 }}>WHAT THE CLAIM GOT WRONG</div>
                        <div style={{ fontSize:13,color:"#8892a4" }}>{counternarrative.key_difference}</div>
                      </div>
                    )}
                    {Array.isArray(counternarrative.verified_sources) && counternarrative.verified_sources.length>0 && (
                      <div>
                        <div style={{ fontSize:10,color:"#6B7280",fontFamily:"monospace",letterSpacing:2,marginBottom:8 }}>VERIFIED BY</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                          {counternarrative.verified_sources.map((s,i)=><span key={i} style={{ fontSize:11,color:"#00e676",fontFamily:"monospace",background:"rgba(0,230,118,0.08)",border:"1px solid rgba(0,230,118,0.2)",borderRadius:4,padding:"3px 10px" }}>✓ {s}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                    <div style={{ background:"rgba(255,23,68,0.05)",border:"1px solid rgba(255,23,68,0.2)",borderRadius:10,padding:16 }}>
                      <div style={{ fontSize:10,color:"#ff1744",fontFamily:"monospace",letterSpacing:2,marginBottom:10 }}>✗ THE CLAIM</div>
                      <div style={{ fontSize:13,color:"#8892a4",lineHeight:1.6,fontStyle:"italic" }}>"{result.claim}"</div>
                    </div>
                    <div style={{ background:"rgba(0,230,118,0.05)",border:"1px solid rgba(0,230,118,0.2)",borderRadius:10,padding:16 }}>
                      <div style={{ fontSize:10,color:"#00e676",fontFamily:"monospace",letterSpacing:2,marginBottom:10 }}>✓ THE TRUTH</div>
                      <div style={{ fontSize:13,color:"#e2e8f0",lineHeight:1.6 }}>{counternarrative.true_version?.split(".")[0]}.</div>
                    </div>
                  </div>
                </div>
              ) : verdict !== "FALSE" && verdict !== "MISLEADING" ? (
                <div style={{ textAlign:"center",padding:"40px 20px",border:"1px dashed rgba(31,41,55,0.8)",borderRadius:10,color:"#6B7280",fontFamily:"monospace",fontSize:12,lineHeight:2 }}>
                  ✓ Counternarrative only generated for FALSE or MISLEADING verdicts<br/>This claim: <span style={{ color:VERDICT_CONFIG[verdict]?.color||"#6B7280" }}>{VERDICT_CONFIG[verdict]?.label||verdict}</span>
                </div>
              ) : (
                <div style={{ textAlign:"center",padding:"40px 20px",border:"1px dashed rgba(31,41,55,0.8)",borderRadius:10,color:"#6B7280",fontFamily:"monospace",fontSize:12,lineHeight:2 }}>
                  No counternarrative available — requires Tavily live data
                </div>
              )}
            </div>
          )}

          {/* SCORING */}
          {activeTab === "scoring" && (
            <div>
              <div style={{ fontSize:10,color:"#4a5568",fontFamily:"monospace",letterSpacing:2,marginBottom:16 }}>CREDIBILITY-WEIGHTED SCORE BREAKDOWN</div>
              {[["WEIGHTED SUPPORT",scoring.weighted_support_ratio||0,"#00e676"],["WEIGHTED CONTRADICTION",scoring.weighted_contradict_ratio||0,"#ff1744"]].map(([l,v,c])=>(
                <div key={l} style={{ marginBottom:16 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}><span style={{ fontSize:11,color:"#4a5568",fontFamily:"monospace" }}>{l}</span><span style={{ fontSize:13,color:c,fontFamily:"monospace",fontWeight:700 }}>{v}%</span></div>
                  <div style={{ background:"#1a2030",borderRadius:100,height:8,overflow:"hidden" }}><div style={{ background:c,height:"100%",width:`${v}%`,borderRadius:100,transition:"width 1.5s ease" }} /></div>
                </div>
              ))}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16 }}>
                {[["Total Sources",scoring.total_sources||0,"#e2e8f0"],["Primary (T1)",scoring.tier1_count||0,"#00e676"],["Press (T2)",scoring.tier2_count||0,"#40c4ff"],["Live Results",scoring.live_results_found||0,(scoring.live_results_found||0)>0?"#00e676":"#4a5568"]].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#060b14",border:"1px solid #1a2030",borderRadius:8,padding:"14px",textAlign:"center" }}>
                    <div style={{ fontSize:24,fontWeight:800,color:c,fontFamily:"monospace" }}>{v}</div>
                    <div style={{ fontSize:10,color:"#4a5568",fontFamily:"monospace",marginTop:4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [groqKey, setGroqKey]     = useState(import.meta.env.VITE_GROQ_API_KEY || "");
  const [tavilyKey, setTavilyKey] = useState(import.meta.env.VITE_TAVILY_API_KEY || "");
  const [claim, setClaim]         = useState("");
  const [warClaim, setWarClaim]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState([]);
  const [error, setError]         = useState("");
  const [mainTab, setMainTab]     = useState("general");
  const [reportFilter, setReportFilter] = useState("all");
  const [showKeys, setShowKeys]   = useState(!import.meta.env.VITE_GROQ_API_KEY);
  const [pipelineSteps, setPipelineSteps] = useState({});
  const [pipelineData, setPipelineData]   = useState({});
  const [activeMode, setActiveMode] = useState(null);

  function onStep(stepId, status, data) {
    setPipelineSteps(prev => ({ ...prev, [stepId]: status }));
    if (data) setPipelineData(prev => ({ ...prev, [stepId]: data }));
  }

  async function analyze(mode) {
    const claimText = mode === "war" ? warClaim : claim;
    if (!claimText.trim()) return;
    if (!groqKey.trim()) { setError("Please enter your Groq API key."); return; }
    setError(""); setLoading(true); setActiveMode(mode);
    setPipelineSteps({}); setPipelineData({});
    try {
      const result = mode === "war"
        ? await runWarPipeline(groqKey, tavilyKey || null, claimText, onStep)
        : await runGeneralPipeline(groqKey, tavilyKey || null, claimText, onStep);
      setResults(prev => [result, ...prev]);
      if (mode === "war") setWarClaim(""); else setClaim("");
    } catch (e) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setTimeout(() => { setLoading(false); setActiveMode(null); setPipelineSteps({}); setPipelineData({}); }, 600);
    }
  }

  const filteredResults = results.filter(r => reportFilter === "all" || r.mode === reportFilter);
  const warResults      = results.filter(r => r.mode === "war");
  const generalResults  = results.filter(r => r.mode === "general");

  const NAV = [
    { id: "general",     label: "🔍 INVESTIGATE", sub: "Any topic" },
    { id: "war",         label: "⚔ WAR ROOM",     sub: "Conflict only" },
    { id: "reports",     label: "📋 REPORTS",      sub: `${results.length} total` },
    { id: "monitor",     label: "📡 MONITOR",      sub: "Detect from posts" },
    { id: "methodology", label: "🔬 HOW IT WORKS", sub: "" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0F1115", color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      
      {/* GUARDIAN SILHOUETTE BACKGROUND */}
      <div style={{ 
        position: "fixed", 
        top: "50%", 
        left: "50%", 
        transform: "translate(-50%, -50%)", 
        width: "600px", 
        height: "600px", 
        background: "radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, rgba(34, 211, 238, 0.05) 50%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        zIndex: 0,
        pointerEvents: "none"
      }} />
      
      {/* SUBTLE GUARDIAN FIGURE */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "480px",
        opacity: 0.06,
        color: "#4F46E5",
        zIndex: 0,
        pointerEvents: "none",
        filter: "blur(3px)",
        userSelect: "none"
      }}>
        🛡️
      </div>

      {/* TOP NAVIGATION BAR */}
      <div style={{ 
        borderBottom: "1px solid rgba(79, 70, 229, 0.15)", 
        padding: "0 40px", 
        position: "sticky", 
        top: 0, 
        background: "rgba(15, 17, 21, 0.92)", 
        backdropFilter: "blur(12px)",
        zIndex: 100,
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* LEFT: Logo + Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Radar Logo */}
            <div style={{ 
              width: 52, 
              height: 52, 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, #4F46E5, #22D3EE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 0 20px rgba(79, 70, 229, 0.5)"
            }}>
              <div style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "2px solid rgba(79, 70, 229, 0.4)",
                animation: "radar-ping 2s ease-out infinite"
              }} />
              <div style={{
                position: "absolute",
                width: "120%",
                height: "120%",
                borderRadius: "50%",
                border: "1px solid rgba(79, 70, 229, 0.2)",
                animation: "radar-ping 2s ease-out infinite 0.5s"
              }} />
              <span style={{ fontSize: 24, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>🛡️</span>
            </div>
            
            <div>
              <div style={{ 
                fontFamily: "'Orbitron', monospace", 
                fontWeight: 800, 
                fontSize: 28, 
                letterSpacing: 4,
                background: "linear-gradient(135deg, #4F46E5, #22D3EE)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                position: "relative"
              }}>
                SENTINEL
                {/* Animated scanning line */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "6px",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, #22D3EE, transparent)",
                  animation: "scan-line 3s ease-in-out infinite",
                  filter: "blur(2px)"
                }} />
              </div>
              <div style={{ 
                fontSize: 11, 
                color: "#4F46E5", 
                fontFamily: "'Inter', sans-serif", 
                letterSpacing: 2,
                fontWeight: 500,
                marginTop: 2
              }}>
                AI Guardian Against Misinformation
              </div>
            </div>
          </div>
          
          {/* RIGHT: Status + Keys */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* System Active Status */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "rgba(0, 230, 118, 0.08)",
              border: "1px solid rgba(0, 230, 118, 0.3)",
              borderRadius: 8,
              boxShadow: "0 0 16px rgba(0, 230, 118, 0.15)"
            }}>
              <div style={{ 
                width: 8, 
                height: 8, 
                borderRadius: "50%", 
                background: "#00E676",
                boxShadow: "0 0 8px #00E676",
                animation: "pulse 2s infinite" 
              }} />
              <span style={{ 
                fontSize: 11, 
                color: "#00E676", 
                fontFamily: "'Inter', monospace",
                fontWeight: 600,
                letterSpacing: 1
              }}>
                SYSTEM ACTIVE
              </span>
            </div>
            
            {tavilyKey && (
              <div style={{
                fontSize: 11,
                color: "#22D3EE",
                fontFamily: "monospace",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                LIVE DATA ENABLED
              </div>
            )}
            
            <button 
              onClick={() => setShowKeys(s => !s)} 
              style={{ 
                background: "rgba(79, 70, 229, 0.12)", 
                border: "1px solid rgba(79, 70, 229, 0.3)", 
                borderRadius: 8, 
                color: "#4F46E5", 
                padding: "8px 16px", 
                cursor: "pointer", 
                fontSize: 11, 
                fontFamily: "'Inter', monospace",
                fontWeight: 600,
                letterSpacing: 1,
                transition: "all 0.3s ease",
                boxShadow: "0 0 0 rgba(79, 70, 229, 0)"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(79, 70, 229, 0.2)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(79, 70, 229, 0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(79, 70, 229, 0.12)";
                e.currentTarget.style.boxShadow = "0 0 0 rgba(79, 70, 229, 0)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {showKeys ? "✕ HIDE KEYS" : "⚙ API KEYS"}
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 0, borderTop: "1px solid rgba(79, 70, 229, 0.1)", paddingTop: 0 }}>
          {NAV.map(n => (
            <button 
              key={n.id} 
              onClick={() => setMainTab(n.id)} 
              style={{ 
                padding: "16px 28px", 
                border: "none", 
                background: mainTab === n.id ? "rgba(79, 70, 229, 0.08)" : "transparent",
                cursor: "pointer", 
                fontFamily: "'Inter', monospace", 
                fontSize: 12, 
                fontWeight: 700, 
                letterSpacing: 1.5, 
                color: mainTab === n.id ? (n.id === "war" ? "#FF1744" : n.id === "monitor" ? "#e040fb" : "#4F46E5") : "#6B7280", 
                borderBottom: mainTab === n.id ? `3px solid ${n.id === "war" ? "#FF1744" : n.id === "monitor" ? "#e040fb" : "#4F46E5"}` : "3px solid transparent",
                transition: "all 0.3s ease",
                position: "relative"
              }}
              onMouseEnter={e => {
                if (mainTab !== n.id) {
                  e.currentTarget.style.color = n.id === "war" ? "#FF1744" : "#4F46E5";
                  e.currentTarget.style.background = "rgba(79, 70, 229, 0.05)";
                }
              }}
              onMouseLeave={e => {
                if (mainTab !== n.id) {
                  e.currentTarget.style.color = "#6B7280";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {n.label}
              {n.sub && (
                <span style={{ 
                  display: "block", 
                  fontSize: 9, 
                  fontWeight: 400, 
                  color: "#4a5568", 
                  marginTop: 4,
                  letterSpacing: 0.5
                }}>
                  {n.sub}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 80px", position: "relative", zIndex: 1 }}>

        {/* API Keys panel */}
        {showKeys && (
          <div style={{ 
            background: "linear-gradient(135deg, rgba(15, 17, 21, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)", 
            border: "1px solid rgba(79, 70, 229, 0.3)", 
            borderRadius: 16, 
            padding: 32, 
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(79, 70, 229, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)"
          }}>
            <div style={{ 
              fontSize: 13, 
              color: "#4F46E5", 
              fontFamily: "'Orbitron', monospace", 
              letterSpacing: 3, 
              marginBottom: 24,
              fontWeight: 700
            }}>
              🔐 API CONFIGURATION
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ 
                  fontSize: 12, 
                  color: "#FF9100", 
                  fontFamily: "'Inter', monospace", 
                  marginBottom: 10,
                  fontWeight: 600,
                  letterSpacing: 1
                }}>
                  GROQ API KEY <span style={{ color: "#FF1744" }}>*REQUIRED</span>
                </div>
                <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 8 }}>
                  Get your key at: <a href="https://console.groq.com" target="_blank" style={{ color: "#22D3EE" }}>console.groq.com</a>
                </div>
                <input 
                  type="password" 
                  placeholder="gsk_..." 
                  value={groqKey} 
                  onChange={e => setGroqKey(e.target.value)} 
                  style={{ 
                    width: "100%",
                    background: "rgba(15, 17, 21, 0.8)",
                    border: "1px solid rgba(79, 70, 229, 0.3)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    color: "#e2e8f0",
                    fontFamily: "'Inter', monospace",
                    fontSize: 13,
                    outline: "none",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "#4F46E5";
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(79, 70, 229, 0.3)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "rgba(79, 70, 229, 0.3)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
              
              <div>
                <div style={{ 
                  fontSize: 12, 
                  color: "#22D3EE", 
                  fontFamily: "'Inter', monospace", 
                  marginBottom: 10,
                  fontWeight: 600,
                  letterSpacing: 1
                }}>
                  TAVILY API KEY <span style={{ color: "#40C4FF" }}>OPTIONAL</span>
                </div>
                <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 8 }}>
                  Enable live web search at: <a href="https://app.tavily.com" target="_blank" style={{ color: "#22D3EE" }}>app.tavily.com</a>
                </div>
                <input 
                  type="password" 
                  placeholder="tvly-..." 
                  value={tavilyKey} 
                  onChange={e => setTavilyKey(e.target.value)} 
                  style={{ 
                    width: "100%",
                    background: "rgba(15, 17, 21, 0.8)",
                    border: "1px solid rgba(34, 211, 238, 0.3)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    color: "#e2e8f0",
                    fontFamily: "'Inter', monospace",
                    fontSize: 13,
                    outline: "none",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "#22D3EE";
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(34, 211, 238, 0.3)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "rgba(34, 211, 238, 0.3)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
            
            <button 
              onClick={() => setShowKeys(false)} 
              style={{ 
                marginTop: 24,
                background: "linear-gradient(135deg, #00E676, #00C853)",
                border: "none",
                borderRadius: 10,
                color: "#0F1115",
                padding: "12px 32px",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'Inter', monospace",
                letterSpacing: 1.5,
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(0, 230, 118, 0.3)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 230, 118, 0.5)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 230, 118, 0.3)";
              }}
            >
              ✓ SAVE & CLOSE
            </button>
          </div>
        )}

        {/* ── GENERAL TAB ── */}
        {mainTab === "general" && (
          <div>
            {/* HERO SECTION */}
            <div style={{ 
              textAlign: "center", 
              padding: "60px 0 50px",
              position: "relative"
            }}>
              <div style={{ 
                fontFamily: "'Orbitron', monospace", 
                fontSize: 72, 
                fontWeight: 900, 
                letterSpacing: 8,
                background: "linear-gradient(135deg, #4F46E5 0%, #22D3EE 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: 16,
                position: "relative",
                textShadow: "0 0 80px rgba(79, 70, 229, 0.5)"
              }}>
                SENTINEL
                {/* Animated scanning line */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "8px",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, #22D3EE, transparent)",
                  animation: "scan-line 4s ease-in-out infinite",
                  filter: "blur(4px)",
                  boxShadow: "0 0 20px #22D3EE"
                }} />
              </div>
              
              <div style={{ 
                fontSize: 18, 
                color: "#8892a4",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                letterSpacing: 3,
                marginBottom: 12
              }}>
                Multi-Layer AI Verification Engine
              </div>
              
              <div style={{
                fontSize: 12,
                color: "#4F46E5",
                fontFamily: "'Inter', monospace",
                fontWeight: 600,
                letterSpacing: 2
              }}>
                PROTECTING TRUTH IN THE AGE OF INFORMATION
              </div>
            </div>
            
            {/* Category grid */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(4, 1fr)", 
              gap: 12, 
              marginBottom: 40 
            }}>
              {Object.entries(GENERAL_CATEGORY_SOURCES).map(([key, cat]) => (
                <div 
                  key={key} 
                  style={{ 
                    padding: "16px 18px", 
                    background: "linear-gradient(135deg, rgba(15, 17, 21, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%)", 
                    border: "1px solid rgba(79, 70, 229, 0.15)", 
                    borderRadius: 12, 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12,
                    transition: "all 0.3s ease",
                    cursor: "default",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#4F46E5";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(79, 70, 229, 0.3)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(79, 70, 229, 0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                  }}
                >
                  <span style={{ fontSize: 24 }}>{cat.icon}</span>
                  <span style={{ 
                    fontSize: 12, 
                    color: "#e2e8f0", 
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500
                  }}>
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>

            {!loading && (
              <>
                {/* PREMIUM INPUT CARD */}
                <div style={{ 
                  background: "linear-gradient(135deg, rgba(15, 17, 21, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)", 
                  border: "2px solid transparent",
                  backgroundClip: "padding-box",
                  borderRadius: 20, 
                  padding: 32, 
                  marginBottom: 32,
                  position: "relative",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(12px)",
                  overflow: "hidden"
                }}>
                  {/* Animated gradient border */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 20,
                    padding: "2px",
                    background: "linear-gradient(135deg, #4F46E5, #22D3EE, #4F46E5)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    animation: "gradient-rotate 3s linear infinite",
                    backgroundSize: "200% 200%",
                    pointerEvents: "none"
                  }} />
                  
                  {/* Soft glass effect glow */}
                  <div style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    width: "200%",
                    height: "200%",
                    background: "radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)",
                    pointerEvents: "none",
                    opacity: 0.5
                  }} />
                  
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <ClaimMonitor groqKey={groqKey} onClaimExtracted={(c) => setClaim(c)} />
                    <div style={{ 
                      fontSize: 13, 
                      color: "#4F46E5", 
                      fontFamily: "'Orbitron', monospace", 
                      letterSpacing: 3, 
                      marginBottom: 20,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 12
                    }}>
                      <span style={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: "50%", 
                        background: "#4F46E5",
                        boxShadow: "0 0 12px #4F46E5",
                        animation: "pulse 2s infinite"
                      }} />
                      SUBMIT CLAIM FOR VERIFICATION
                    </div>
                    
                    <textarea 
                      value={claim} 
                      onChange={e => setClaim(e.target.value)} 
                      onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyze("general"); }}
                      placeholder="Enter any claim, news headline, or statement to verify..."
                      rows={4} 
                      style={{ 
                        width: "100%",
                        background: "rgba(15, 17, 21, 0.6)",
                        border: "1px solid rgba(79, 70, 229, 0.2)",
                        borderRadius: 12,
                        padding: "18px 20px",
                        color: "#e2e8f0",
                        fontSize: 16,
                        lineHeight: 1.7,
                        resize: "none",
                        fontFamily: "'Inter', sans-serif",
                        outline: "none",
                        transition: "all 0.3s ease"
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = "#4F46E5";
                        e.currentTarget.style.boxShadow = "0 0 24px rgba(79, 70, 229, 0.3)";
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = "rgba(79, 70, 229, 0.2)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    
                    <div style={{ 
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 20,
                      paddingTop: 20,
                      borderTop: "1px solid rgba(79, 70, 229, 0.15)"
                    }}>
                      <div style={{ 
                        fontSize: 12, 
                        color: "#6B7280", 
                        fontFamily: "'Inter', monospace",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}>
                        <span>⏱️ ~20s analysis</span>
                        <span>·</span>
                        <span>{tavilyKey ? "⚡ Live search active" : "Add Tavily for live data"}</span>
                      </div>
                      
                      <div style={{ display: "flex", gap: 12 }}>
                        {/* Random Example Button */}
                        <button 
                          onClick={() => setClaim(GENERAL_SAMPLES[Math.floor(Math.random() * GENERAL_SAMPLES.length)])}
                          style={{ 
                            background: "rgba(79, 70, 229, 0.12)",
                            border: "1px solid rgba(79, 70, 229, 0.3)",
                            borderRadius: 10,
                            color: "#4F46E5",
                            padding: "12px 24px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "'Inter', monospace",
                            letterSpacing: 1,
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(79, 70, 229, 0.2)";
                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(79, 70, 229, 0.3)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(79, 70, 229, 0.12)";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          🎲 Random Example
                        </button>
                        
                        {/* Verify Claim Button */}
                        <button 
                          onClick={() => analyze("general")} 
                          disabled={!claim.trim()} 
                          style={{ 
                            background: claim.trim() ? "linear-gradient(135deg, #4F46E5, #22D3EE)" : "rgba(79, 70, 229, 0.2)",
                            border: "none",
                            borderRadius: 10,
                            color: claim.trim() ? "#ffffff" : "#6B7280",
                            padding: "12px 32px",
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: claim.trim() ? "pointer" : "not-allowed",
                            fontFamily: "'Inter', monospace",
                            letterSpacing: 1.5,
                            boxShadow: claim.trim() ? "0 4px 16px rgba(79, 70, 229, 0.4)" : "none",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                          }}
                          onMouseEnter={e => {
                            if (claim.trim()) {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 8px 24px rgba(79, 70, 229, 0.6)";
                            }
                          }}
                          onMouseLeave={e => {
                            if (claim.trim()) {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 4px 16px rgba(79, 70, 229, 0.4)";
                            }
                          }}
                        >
                          🔍 VERIFY CLAIM
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* SAMPLES SECTION */}
                <div style={{ marginBottom: 40 }}>
                  <div style={{ 
                    fontSize: 11,
                    color: "#6B7280",
                    fontFamily: "'Inter', monospace",
                    letterSpacing: 2,
                    marginBottom: 16,
                    fontWeight: 600
                  }}>
                    TRY SAMPLE CLAIMS
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {GENERAL_SAMPLES.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => setClaim(s)} 
                        style={{ 
                          background: "rgba(79, 70, 229, 0.06)",
                          border: "1px solid rgba(79, 70, 229, 0.2)",
                          borderRadius: 10,
                          color: "#8892a4",
                          padding: "10px 16px",
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: "'Inter', sans-serif",
                          textAlign: "left",
                          maxWidth: 360,
                          lineHeight: 1.5,
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "#4F46E5";
                          e.currentTarget.style.color = "#e2e8f0";
                          e.currentTarget.style.background = "rgba(79, 70, 229, 0.12)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(79, 70, 229, 0.2)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "rgba(79, 70, 229, 0.2)";
                          e.currentTarget.style.color = "#8892a4";
                          e.currentTarget.style.background = "rgba(79, 70, 229, 0.06)";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {s.length > 70 ? s.slice(0, 70) + "…" : s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {loading && activeMode === "general" && <PipelineProgress steps={pipelineSteps} stepData={pipelineData} mode="general" />}
            {error && <div style={{ background:"rgba(255,23,68,0.08)",border:"1px solid rgba(255,23,68,0.3)",borderRadius:8,padding:"12px 16px",fontSize:13,color:"#ff1744",fontFamily:"monospace",marginBottom:20 }}>✗ {error}</div>}
            {!loading && generalResults.length > 0 && (
              <div>
                <div style={{ fontSize:11,color:"#4a5568",fontFamily:"monospace",letterSpacing:2,marginBottom:16 }}>// LATEST RESULT</div>
                <InvestigationReport result={generalResults[0]} index={0} />
                {generalResults.length > 1 && <div onClick={()=>{setMainTab("reports");setReportFilter("general");}} style={{ textAlign:"center",padding:12,border:"1px dashed #1e2d40",borderRadius:8,color:"#4a5568",fontSize:12,fontFamily:"monospace",cursor:"pointer" }}>View all {generalResults.length} investigations →</div>}
              </div>
            )}
            {!loading && generalResults.length === 0 && !error && (
              <div style={{ textAlign:"center",padding:"60px 20px",border:"1px dashed #1a2030",borderRadius:12,color:"#2d3748",fontFamily:"monospace",fontSize:13,lineHeight:2.5 }}>
                [ SENTINEL standing by ]<br/><span style={{ fontSize:11 }}>Celebrities · Sports · Health · History · Science · Politics · Business · Viral</span>
              </div>
            )}
          </div>
        )}

        {/* ── WAR ROOM TAB ── */}
        {mainTab === "war" && (
          <div>
            {/* WAR ROOM HERO */}
            <div style={{ 
              background: "linear-gradient(135deg, rgba(255, 23, 68, 0.08) 0%, rgba(255, 145, 0, 0.05) 100%)", 
              border: "2px solid rgba(255, 23, 68, 0.3)", 
              borderRadius: 20, 
              padding: "32px 40px", 
              marginBottom: 40,
              display: "flex",
              alignItems: "center",
              gap: 24,
              boxShadow: "0 8px 32px rgba(255, 23, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px)",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Glow effect */}
              <div style={{
                position: "absolute",
                top: "-50%",
                right: "-20%",
                width: "400px",
                height: "400px",
                background: "radial-gradient(circle, rgba(255, 23, 68, 0.15) 0%, transparent 70%)",
                pointerEvents: "none"
              }} />
              
              <div style={{ 
                fontSize: 64,
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 0 20px rgba(255, 23, 68, 0.5))"
              }}>
                ⚔️
              </div>
              
              <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                <div style={{ 
                  fontSize: 24, 
                  color: "#FF1744", 
                  fontFamily: "'Orbitron', monospace", 
                  fontWeight: 900, 
                  letterSpacing: 4,
                  marginBottom: 10,
                  textShadow: "0 0 20px rgba(255, 23, 68, 0.5)"
                }}>
                  WAR ROOM
                </div>
                
                <div style={{ 
                  fontSize: 14, 
                  color: "#e2e8f0",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  letterSpacing: 1,
                  marginBottom: 8
                }}>
                  Conflict Intelligence & Military Verification
                </div>
                
                <div style={{ 
                  fontSize: 12, 
                  color: "#8892a4", 
                  lineHeight: 1.7,
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Specialized for war & conflict · Country-aware military + government sources · 10 active conflict zones
                </div>
              </div>
            </div>

            {/* Active Conflict Networks */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ 
                fontSize: 11,
                color: "#6B7280",
                fontFamily: "'Inter', monospace",
                letterSpacing: 2,
                marginBottom: 16,
                fontWeight: 600
              }}>
                ACTIVE CONFLICT NETWORKS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {Object.keys(WAR_COUNTRY_SOURCES).map(country => (
                  <div 
                    key={country} 
                    style={{ 
                      padding: "8px 16px",
                      background: "rgba(255, 23, 68, 0.08)",
                      border: "1px solid rgba(255, 23, 68, 0.3)",
                      borderRadius: 10,
                      fontSize: 11,
                      color: "#FF1744",
                      fontFamily: "'Inter', monospace",
                      fontWeight: 600,
                      letterSpacing: 1,
                      transition: "all 0.3s ease",
                      cursor: "default"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(255, 23, 68, 0.15)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(255, 23, 68, 0.3)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255, 23, 68, 0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    🌍 {country.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            {!loading && (
              <>
                {/* WAR ROOM INPUT CARD */}
                <div style={{ 
                  background: "linear-gradient(135deg, rgba(15, 17, 21, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)", 
                  border: "2px solid rgba(255, 23, 68, 0.3)",
                  borderRadius: 20, 
                  padding: 32, 
                  marginBottom: 32,
                  position: "relative",
                  boxShadow: "0 8px 32px rgba(255, 23, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(12px)",
                  overflow: "hidden"
                }}>
                  {/* Animated gradient border */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 20,
                    padding: "2px",
                    background: "linear-gradient(135deg, #FF1744, #FF9100, #FF1744)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    animation: "gradient-rotate 3s linear infinite",
                    backgroundSize: "200% 200%",
                    pointerEvents: "none"
                  }} />
                  
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <ClaimMonitor groqKey={groqKey} onClaimExtracted={(c) => setWarClaim(c)} />
                    <div style={{ 
                      fontSize: 13, 
                      color: "#FF1744", 
                      fontFamily: "'Orbitron', monospace", 
                      letterSpacing: 3, 
                      marginBottom: 20,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 12
                    }}>
                      <span style={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: "50%", 
                        background: "#FF1744",
                        boxShadow: "0 0 12px #FF1744",
                        animation: "pulse 2s infinite"
                      }} />
                      SUBMIT WAR / CONFLICT CLAIM
                    </div>
                    
                    <textarea 
                      value={warClaim} 
                      onChange={e => setWarClaim(e.target.value)} 
                      onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyze("war"); }}
                      placeholder="Enter any war, conflict, or military claim to verify..."
                      rows={4} 
                      style={{ 
                        width: "100%",
                        background: "rgba(15, 17, 21, 0.6)",
                        border: "1px solid rgba(255, 23, 68, 0.2)",
                        borderRadius: 12,
                        padding: "18px 20px",
                        color: "#e2e8f0",
                        fontSize: 16,
                        lineHeight: 1.7,
                        resize: "none",
                        fontFamily: "'Inter', sans-serif",
                        outline: "none",
                        transition: "all 0.3s ease"
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = "#FF1744";
                        e.currentTarget.style.boxShadow = "0 0 24px rgba(255, 23, 68, 0.3)";
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = "rgba(255, 23, 68, 0.2)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    
                    <div style={{ 
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 20,
                      paddingTop: 20,
                      borderTop: "1px solid rgba(255, 23, 68, 0.15)"
                    }}>
                      <div style={{ 
                        fontSize: 12, 
                        color: "#6B7280", 
                        fontFamily: "'Inter', monospace",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}>
                        <span>⏱️ ~20s analysis</span>
                        <span>·</span>
                        <span>🌍 Country-aware</span>
                        <span>·</span>
                        <span>{tavilyKey ? "⚡ Live intel active" : "Add Tavily for live data"}</span>
                      </div>
                      
                      <div style={{ display: "flex", gap: 12 }}>
                        {/* Random Example Button */}
                        <button 
                          onClick={() => setWarClaim(WAR_SAMPLES[Math.floor(Math.random() * WAR_SAMPLES.length)])}
                          style={{ 
                            background: "rgba(255, 23, 68, 0.12)",
                            border: "1px solid rgba(255, 23, 68, 0.3)",
                            borderRadius: 10,
                            color: "#FF1744",
                            padding: "12px 24px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "'Inter', monospace",
                            letterSpacing: 1,
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(255, 23, 68, 0.2)";
                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(255, 23, 68, 0.3)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(255, 23, 68, 0.12)";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          🎲 Random Example
                        </button>
                        
                        {/* Launch War Intel Button */}
                        <button 
                          onClick={() => analyze("war")} 
                          disabled={!warClaim.trim()} 
                          style={{ 
                            background: warClaim.trim() ? "linear-gradient(135deg, #FF1744, #FF9100)" : "rgba(255, 23, 68, 0.2)",
                            border: "none",
                            borderRadius: 10,
                            color: warClaim.trim() ? "#ffffff" : "#6B7280",
                            padding: "12px 32px",
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: warClaim.trim() ? "pointer" : "not-allowed",
                            fontFamily: "'Inter', monospace",
                            letterSpacing: 1.5,
                            boxShadow: warClaim.trim() ? "0 4px 16px rgba(255, 23, 68, 0.4)" : "none",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                          }}
                          onMouseEnter={e => {
                            if (warClaim.trim()) {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 23, 68, 0.6)";
                            }
                          }}
                          onMouseLeave={e => {
                            if (warClaim.trim()) {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 4px 16px rgba(255, 23, 68, 0.4)";
                            }
                          }}
                        >
                          ⚔️ LAUNCH WAR INTEL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* WAR SAMPLES SECTION */}
                <div style={{ marginBottom: 40 }}>
                  <div style={{ 
                    fontSize: 11,
                    color: "#6B7280",
                    fontFamily: "'Inter', monospace",
                    letterSpacing: 2,
                    marginBottom: 16,
                    fontWeight: 600
                  }}>
                    TRY SAMPLE WAR CLAIMS
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {WAR_SAMPLES.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => setWarClaim(s)} 
                        style={{ 
                          background: "rgba(255, 23, 68, 0.06)",
                          border: "1px solid rgba(255, 23, 68, 0.2)",
                          borderRadius: 10,
                          color: "#8892a4",
                          padding: "10px 16px",
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: "'Inter', sans-serif",
                          textAlign: "left",
                          maxWidth: 360,
                          lineHeight: 1.5,
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "#FF1744";
                          e.currentTarget.style.color = "#e2e8f0";
                          e.currentTarget.style.background = "rgba(255, 23, 68, 0.12)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(255, 23, 68, 0.2)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "rgba(255, 23, 68, 0.2)";
                          e.currentTarget.style.color = "#8892a4";
                          e.currentTarget.style.background = "rgba(255, 23, 68, 0.06)";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {s.length > 70 ? s.slice(0, 70) + "…" : s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {loading && activeMode === "war" && <PipelineProgress steps={pipelineSteps} stepData={pipelineData} mode="war" />}
            {error && <div style={{ background:"rgba(255,23,68,0.08)",border:"1px solid rgba(255,23,68,0.3)",borderRadius:8,padding:"12px 16px",fontSize:13,color:"#ff1744",fontFamily:"monospace",marginBottom:20 }}>✗ {error}</div>}
            {!loading && warResults.length > 0 && (
              <div>
                <div style={{ fontSize:11,color:"#ff4444",fontFamily:"monospace",letterSpacing:2,marginBottom:16 }}>// LATEST WAR ROOM RESULT</div>
                <InvestigationReport result={warResults[0]} index={0} />
                {warResults.length > 1 && <div onClick={()=>{setMainTab("reports");setReportFilter("war");}} style={{ textAlign:"center",padding:12,border:"1px dashed rgba(255,68,68,0.2)",borderRadius:8,color:"#4a5568",fontSize:12,fontFamily:"monospace",cursor:"pointer" }}>View all {warResults.length} war room investigations →</div>}
              </div>
            )}
            {!loading && warResults.length === 0 && !error && (
              <div style={{ textAlign:"center",padding:"60px 20px",border:"1px dashed rgba(255,68,68,0.15)",borderRadius:12,color:"#2d3748",fontFamily:"monospace",fontSize:13,lineHeight:2.5 }}>
                [ WAR ROOM standing by ]<br/><span style={{ fontSize:11 }}>Iran · India · Pakistan · Russia · Ukraine · Israel · Palestine · USA · China · Sudan</span>
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS TAB ── */}
        {mainTab === "reports" && (
          <div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
              <div style={{ fontSize:11,color:"#4a5568",fontFamily:"monospace",letterSpacing:2 }}>// ALL INVESTIGATIONS — {results.length} total · {generalResults.length} general · {warResults.length} war</div>
              <div style={{ display:"flex",gap:4 }}>
                {[["all","All"],["general","General"],["war","War Room"]].map(([f,l])=>(
                  <button key={f} onClick={()=>setReportFilter(f)} style={{ padding:"6px 14px",border:"1px solid",borderColor:reportFilter===f?(f==="war"?"#ff4444":"#ff9100"):"#1e2d40",borderRadius:6,background:"transparent",cursor:"pointer",fontFamily:"monospace",fontSize:10,color:reportFilter===f?(f==="war"?"#ff4444":"#ff9100"):"#4a5568",letterSpacing:1 }}>{l}</button>
                ))}
              </div>
            </div>
            {filteredResults.length === 0
              ? <div style={{ textAlign:"center",padding:"60px 20px",border:"1px dashed #1a2030",borderRadius:12,color:"#2d3748",fontFamily:"monospace",fontSize:13 }}>No investigations yet</div>
              : filteredResults.map((r,i) => <InvestigationReport key={r.timestamp} result={r} index={i} />)
            }
          </div>
        )}

        {/* ── METHODOLOGY TAB ── */}
        {/* ── MONITOR TAB ── */}
        {mainTab === "monitor" && (
          <div>
            {/* Hero */}
            <div style={{ background:"linear-gradient(135deg, rgba(224,64,251,0.06) 0%, rgba(124,77,255,0.06) 100%)", border:"1px solid rgba(224,64,251,0.2)", borderRadius:16, padding:"28px 32px", marginBottom:32, display:"flex", alignItems:"center", gap:20 }}>
              <div style={{ width:60, height:60, borderRadius:14, background:"rgba(224,64,251,0.15)", border:"1px solid rgba(224,64,251,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, flexShrink:0 }}>📡</div>
              <div>
                <div style={{ fontSize:18, color:"#e040fb", fontFamily:"'Orbitron', monospace", fontWeight:800, letterSpacing:3, marginBottom:8 }}>CLAIM MONITOR</div>
                <div style={{ fontSize:13, color:"#6B7280", lineHeight:1.7 }}>Paste any social media post, news headline, WhatsApp forward, or article. SENTINEL extracts the verifiable claim, measures its spread across platforms, then runs the full 8-step verification pipeline.</div>
              </div>
            </div>

            {/* How it works */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:32 }}>
              {[
                ["①","Paste Content","Drop any social post or article text","#e040fb"],
                ["②","Claim Extracted","AI pulls the core verifiable claim","#7c4dff"],
                ["③","Spread Measured","Checks how far it's spreading across platforms","#ff9100"],
                ["④","Full Investigation","8-step pipeline verifies with live data","#00e676"],
              ].map(([num,title,desc,color])=>(
                <div key={num} style={{ background:"linear-gradient(135deg, rgba(15,17,21,0.8) 0%, rgba(31,41,55,0.6) 100%)", border:`1px solid ${color}25`, borderRadius:12, padding:18, textAlign:"center" }}>
                  <div style={{ fontSize:24, color, fontFamily:"'Orbitron', monospace", fontWeight:800, marginBottom:8 }}>{num}</div>
                  <div style={{ fontSize:12, color:"#e2e8f0", fontFamily:"'Orbitron', monospace", fontWeight:700, marginBottom:6, letterSpacing:1 }}>{title}</div>
                  <div style={{ fontSize:11, color:"#6B7280", lineHeight:1.5 }}>{desc}</div>
                </div>
              ))}
            </div>

            {!loading && (
              <>
                {/* Full claim monitor input */}
                <div style={{ background:"linear-gradient(135deg, rgba(224,64,251,0.04) 0%, rgba(124,77,255,0.04) 100%)", border:"1px solid rgba(224,64,251,0.25)", borderRadius:16, padding:28, marginBottom:28 }}>
                  <div style={{ fontSize:13, color:"#e040fb", fontFamily:"'Orbitron', monospace", fontWeight:700, letterSpacing:3, marginBottom:16 }}>📡 PASTE ANY CONTENT TO INVESTIGATE</div>
                  <div style={{ fontSize:12, color:"#6B7280", marginBottom:16, lineHeight:1.7 }}>
                    Works with tweets, Facebook posts, WhatsApp messages, news headlines, or any text containing a factual claim. SENTINEL extracts the core claim and routes it to the right investigation pipeline.
                  </div>
                  <textarea value={claim} onChange={e=>setClaim(e.target.value)}
                    placeholder={"Paste social media post or article text here...\n\nExamples:\n• \"BREAKING: Taylor Swift announces she\'s pregnant with Travis Kelce\'s baby \"\n• \"Scientists CONFIRM: 5G towers cause cancer, governments hiding the truth\"\n• \"Russia launches nuclear strike on Poland — NATO invoking Article 5\"\n• \"Apple buying Netflix confirmed — $200B deal closes next month\""}
                    rows={6} style={{ width:"100%", background:"rgba(15,17,21,0.6)", border:"1px solid rgba(224,64,251,0.2)", borderRadius:12, padding:"18px 20px", color:"#e2e8f0", fontSize:15, lineHeight:1.7, resize:"none", fontFamily:"'Inter', sans-serif", outline:"none", marginBottom:16, transition:"all 0.3s ease" }} />
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                    <button onClick={()=>analyze("general")} disabled={!claim.trim()||loading}
                      style={{ background:claim.trim()&&!loading?"linear-gradient(135deg,#4F46E5,#22D3EE)":"rgba(31,41,55,0.6)", border:"none", borderRadius:12, color:"#fff", padding:"14px 28px", fontSize:13, fontWeight:700, cursor:claim.trim()&&!loading?"pointer":"not-allowed", opacity:claim.trim()&&!loading?1:0.5, fontFamily:"'Orbitron', monospace", letterSpacing:1 }}>
                      🔍 INVESTIGATE AS GENERAL CLAIM
                    </button>
                    <button onClick={()=>analyze("war")} disabled={!claim.trim()||loading}
                      style={{ background:claim.trim()&&!loading?"linear-gradient(135deg,#FF1744,#ff9100)":"rgba(31,41,55,0.6)", border:"none", borderRadius:12, color:"#fff", padding:"14px 28px", fontSize:13, fontWeight:700, cursor:claim.trim()&&!loading?"pointer":"not-allowed", opacity:claim.trim()&&!loading?1:0.5, fontFamily:"'Orbitron', monospace", letterSpacing:1 }}>
                      ⚔ INVESTIGATE AS WAR CLAIM
                    </button>
                  </div>
                </div>

                {/* Sample viral posts */}
                <div style={{ marginBottom:28 }}>
                  <div style={{ fontSize:11, color:"#374151", fontFamily:"'Orbitron', monospace", letterSpacing:2, marginBottom:14 }}>// SAMPLE VIRAL POSTS TO TRY</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {[
                      { text:"🚨 BREAKING: Scientists at Harvard confirm that coffee cures cancer — mainstream media is hiding this! Share before they delete this!!!", type:"Health Misinfo", color:"#ff9100" },
                      { text:"Just confirmed by multiple sources: Elon Musk is buying Google for $500 billion. The deal is expected to close by end of 2026.", type:"Business Claim", color:"#4F46E5" },
                      { text:"WOW: Russia just launched ballistic missiles at 3 NATO capitals. This is it — World War 3 has officially started.", type:"War Claim", color:"#FF1744" },
                      { text:"FACT: The Great Wall of China is visible from the moon with the naked eye. This is a proven scientific fact taught in schools.", type:"History Myth", color:"#00e676" },
                    ].map((s,i)=>(
                      <button key={i} onClick={()=>setClaim(s.text)}
                        style={{ background:"transparent", border:`1px solid ${s.color}20`, borderRadius:12, padding:"14px 18px", cursor:"pointer", textAlign:"left", display:"flex", gap:14, alignItems:"flex-start", transition:"all 0.3s ease" }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=`${s.color}50`;e.currentTarget.style.background=`${s.color}06`;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=`${s.color}20`;e.currentTarget.style.background="transparent";}}>
                        <span style={{ fontSize:10, color:s.color, fontFamily:"monospace", background:`${s.color}12`, border:`1px solid ${s.color}30`, borderRadius:4, padding:"3px 10px", flexShrink:0, marginTop:2, whiteSpace:"nowrap" }}>{s.type}</span>
                        <span style={{ fontSize:12, color:"#8892a4", lineHeight:1.6 }}>{s.text.slice(0,130)}{s.text.length>130?"…":""}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {loading && (activeMode==="general"||activeMode==="war") && <PipelineProgress steps={pipelineSteps} stepData={pipelineData} mode={activeMode} />}
            {error && <div style={{ background:"rgba(255,23,68,0.08)",border:"1px solid rgba(255,23,68,0.3)",borderRadius:10,padding:"14px 18px",fontSize:13,color:"#FF1744",fontFamily:"monospace",marginBottom:20 }}>✗ {error}</div>}
            {!loading && results.length>0 && (
              <div>
                <div style={{ fontSize:11,color:"#e040fb",fontFamily:"'Orbitron', monospace",letterSpacing:2,marginBottom:16 }}>// LATEST MONITORED RESULT</div>
                <InvestigationReport result={results[0]} index={0} />
              </div>
            )}
          </div>
        )}

        {mainTab === "methodology" && (
          <div>
            <div style={{ fontSize:11,color:"#4a5568",fontFamily:"monospace",letterSpacing:2,marginBottom:20 }}>// HOW SENTINEL WORKS</div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20 }}>
              <div style={{ background:"#0d1117",border:"1px solid rgba(0,229,255,0.2)",borderRadius:10,padding:20 }}>
                <div style={{ fontSize:12,color:"#00e5ff",fontFamily:"monospace",fontWeight:700,marginBottom:12 }}>🔍 GENERAL INVESTIGATOR</div>
                <div style={{ fontSize:12,color:"#4a5568",lineHeight:1.9 }}>• 8 topic categories<br/>• Auto-detects from claim text<br/>• Category-specific sources<br/>• Celebrities · Sports · Health · History · Science · Politics · Business · Viral</div>
              </div>
              <div style={{ background:"#0d1117",border:"1px solid rgba(255,68,68,0.2)",borderRadius:10,padding:20 }}>
                <div style={{ fontSize:12,color:"#ff4444",fontFamily:"monospace",fontWeight:700,marginBottom:12 }}>⚔ WAR ROOM</div>
                <div style={{ fontSize:12,color:"#4a5568",lineHeight:1.9 }}>• 10 active conflict zones<br/>• Country-aware military sources<br/>• Government + press tiers<br/>• War · Conflict · Geopolitics · Military claims</div>
              </div>
            </div>

            <div style={{ background:"#0d1117",border:"1px solid #1e2d40",borderRadius:10,padding:24,marginBottom:16 }}>
              <div style={{ fontSize:13,color:"#ff9100",fontFamily:"monospace",fontWeight:700,marginBottom:16 }}>SHARED 8-STEP PIPELINE</div>
              {PIPELINE_STEPS.map((s,i)=>(
                <div key={i} style={{ display:"flex",gap:14,padding:"10px 0",borderBottom:i<PIPELINE_STEPS.length-1?"1px solid #1a2030":"none" }}>
                  <div style={{ width:26,height:26,borderRadius:"50%",background:"#1e2d40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#ff9100",fontFamily:"monospace",fontWeight:700,flexShrink:0 }}>{i+1}</div>
                  <div><div style={{ fontSize:13,color:"#e2e8f0",fontFamily:"monospace",marginBottom:3 }}>{s.icon} {s.label}</div><div style={{ fontSize:12,color:"#4a5568" }}>{s.desc}</div></div>
                </div>
              ))}
            </div>

            <div style={{ background:"#0d1117",border:"1px solid rgba(0,229,255,0.15)",borderRadius:10,padding:24,marginBottom:16 }}>
              <div style={{ fontSize:13,color:"#00e5ff",fontFamily:"monospace",fontWeight:700,marginBottom:16 }}>GENERAL — CATEGORY SOURCES</div>
              {Object.entries(GENERAL_CATEGORY_SOURCES).map(([key,cat])=>(
                <div key={key} style={{ marginBottom:12,padding:14,background:"#060b14",borderRadius:8 }}>
                  <div style={{ fontSize:12,color:"#00e5ff",fontFamily:"monospace",fontWeight:700,marginBottom:6 }}>{cat.icon} {cat.label}</div>
                  <div style={{ fontSize:11,color:"#00e676",marginBottom:4 }}>T1: {cat.tier1.join(" · ")}</div>
                  <div style={{ fontSize:11,color:"#40c4ff" }}>T2: {cat.tier2.join(" · ")}</div>
                </div>
              ))}
            </div>

            <div style={{ background:"#0d1117",border:"1px solid rgba(255,68,68,0.15)",borderRadius:10,padding:24 }}>
              <div style={{ fontSize:13,color:"#ff4444",fontFamily:"monospace",fontWeight:700,marginBottom:16 }}>WAR ROOM — COUNTRY SOURCES</div>
              {Object.entries(WAR_COUNTRY_SOURCES).map(([country,data])=>(
                <div key={country} style={{ marginBottom:12,padding:14,background:"#060b14",borderRadius:8 }}>
                  <div style={{ fontSize:12,color:"#ff4444",fontFamily:"monospace",fontWeight:700,marginBottom:6 }}>🌍 {country.toUpperCase()}</div>
                  <div style={{ fontSize:11,color:"#00e676",marginBottom:4 }}>T1: {data.tier1.join(" · ")}</div>
                  <div style={{ fontSize:11,color:"#40c4ff" }}>T2: {data.tier2.join(" · ")}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* FOOTER */}
      <div style={{
        borderTop: "1px solid rgba(79, 70, 229, 0.15)",
        padding: "32px 40px",
        textAlign: "center",
        position: "relative",
        zIndex: 1
      }}>
        <div style={{
          fontSize: 13,
          color: "#6B7280",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          letterSpacing: 1
        }}>
          <span style={{
            background: "linear-gradient(135deg, #4F46E5, #22D3EE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: 700,
            fontFamily: "'Orbitron', monospace"
          }}>
            Sentinel AI
          </span>
          {" — "}Protecting Truth in the Age of Information
        </div>
        <div style={{
          fontSize: 10,
          color: "#4a5568",
          fontFamily: "'Inter', monospace",
          marginTop: 8,
          letterSpacing: 0.5
        }}>
          Multi-Layer Verification Engine · Powered by Advanced AI
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
        
        @keyframes pulse { 
          0%, 100% { opacity: 1; } 
          50% { opacity: 0.4; } 
        }
        
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        
        @keyframes progress { 
          from { width: 0%; } 
          to { width: 100%; } 
        }
        
        @keyframes scan-line {
          0% { left: -10%; opacity: 0; }
          50% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        
        @keyframes radar-ping {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes gradient-rotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(79, 70, 229, 0.4); 
          }
          50% { 
            box-shadow: 0 0 40px rgba(79, 70, 229, 0.8); 
          }
        }
        
        * { 
          box-sizing: border-box; 
          margin: 0;
          padding: 0;
        }
        
        ::-webkit-scrollbar { 
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track { 
          background: #0F1115; 
        }
        
        ::-webkit-scrollbar-thumb { 
          background: linear-gradient(135deg, #4F46E5, #22D3EE);
          borderRadius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5850E8, #2DDCF7);
        }
        
        textarea::placeholder,
        input::placeholder { 
          color: #4a5568; 
          opacity: 0.6;
        }
        
        button {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}
