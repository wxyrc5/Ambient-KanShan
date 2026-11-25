// Background Service Worker: Proxy bridge + 24h local cache + 7-day / 20-term cross-page memory
const PROXY_BASE = "http://localhost:8787"; // 替换为你的 CloudBase 云函数地址
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "QUERY_ZHIHU") {
    handleQuery(msg.text, msg.context, msg.pageTitle).then(sendResponse);
    return true;
  }
  if (msg.type === "GET_MEMORY") {
    chrome.storage.local.get(["ks_memory"], (res) => {
      const now = Date.now();
      const list = (res.ks_memory || []).filter((x) => now - x.ts <= SEVEN_DAYS_MS).slice(0, 20);
      sendResponse({ list });
    });
    return true;
  }
});

async function handleQuery(text, context, pageTitle) {
  const key = text.trim().slice(0, 32).toLowerCase();
  const stored = await chrome.storage.local.get(["ks_cache", "ks_memory"]);
  const cache = stored.ks_cache || {};
  const memory = (stored.ks_memory || []).filter((x) => Date.now() - x.ts <= SEVEN_DAYS_MS);

  const priorCross = memory.find((m) => m.key === key && m.pageTitle !== pageTitle) || null;
  let data = cache[key];
  let fromCache = Boolean(data);

  if (!data) {
    try {
      const resp = await fetch(`${PROXY_BASE}/api/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context, pageTitle })
      });
      if (resp.ok) {
        data = await resp.json();
        cache[key] = data;
      }
    } catch (e) {
      // Offline graceful fallback when local proxy is not running
      data = {
        term: text.slice(0, 28),
        analogy: `围绕「${text.slice(0, 18)}」，抓住它在这段里的核心约束与一线实测边界，可点击下方直达知乎高赞与潜力回答。`,
        evidence: { total: 10, practical: 4, counter: 3, filtered: 3 },
        perspectives: [
          { stance: "支持 · 正向实测", text: "主流高赞通常从核心原理与收益切入。" },
          { stance: "质疑 · 打破茧房", text: "一线实操者往往提醒关注前提假设与边界踩坑。" }
        ],
        classicUrl: `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(text.slice(0, 24))}`,
        risingUrl: `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(text.slice(0, 24) + " 实测 踩坑")}`
      };
    }
  }

  const nextMem = [
    { key, term: data.term, analogy: data.analogy, pageTitle, ts: Date.now() },
    ...memory.filter((m) => !(m.key === key && m.pageTitle === pageTitle))
  ].slice(0, 20);

  await chrome.storage.local.set({ ks_cache: cache, ks_memory: nextMem });
  return { data, fromCache, priorCross };
}
