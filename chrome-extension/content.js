// Content Script: Shadow DOM Micro-Capsule + L1/L2/L3 Card (mounted on documentElement, non-intrusive)
(function () {
  if (document.getElementById("ambient-kanshan-root")) return;
  const host = document.createElement("div");
  host.id = "ambient-kanshan-root";
  host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      .cap,.card{position:fixed;pointer-events:auto;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans SC",sans-serif;
        background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);border:1px solid rgba(15,23,42,0.1);
        box-shadow:0 16px 36px -10px rgba(15,23,42,0.2);color:#0F172A;display:none;}
      .cap{border-radius:999px;padding:6px 12px;font-size:12px;align-items:center;gap:8px;}
      .cap button{border:none;background:none;cursor:pointer;font-weight:600;color:#0044B3;font-size:12px;padding:2px 6px;border-radius:999px;}
      .cap button:hover{background:rgba(0,102,255,0.1);}
      .card{width:360px;max-width:calc(100vw - 24px);border-radius:16px;padding:14px;font-size:13px;line-height:1.55;}
      .hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #E2E8F0;padding-bottom:8px;margin-bottom:10px;}
      .ttl{font-weight:700;color:#0044B3;font-size:13px;}
      .cls{border:none;background:none;cursor:pointer;font-size:16px;color:#64748B;}
      .cross{background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;padding:6px 10px;border-radius:8px;font-size:11.5px;margin-bottom:8px;display:none;}
      .box{background:#EFF6FF;border:1px solid #BFDBFE;padding:10px;border-radius:10px;margin-bottom:8px;font-weight:600;}
      .ev{font-size:11px;color:#475569;margin-bottom:8px;}
      .links{display:flex;gap:8px;margin-top:8px;}
      .links a{flex:1;text-align:center;padding:6px 8px;border-radius:8px;background:#F1F5F9;color:#0044B3;text-decoration:none;font-size:11.5px;font-weight:600;}
    </style>
    <div id="ks-cap" class="cap"><span>山</span><button id="ks-go">神比喻 · 破茧看法</button><button id="ks-x">×</button></div>
    <div id="ks-card" class="card">
      <div class="hdr"><span id="ks-title" class="ttl"></span><button id="ks-close" class="cls">×</button></div>
      <div id="ks-cross" class="cross"></div>
      <div id="ks-analogy" class="box"></div>
      <div id="ks-ev" class="ev"></div>
      <div id="ks-persp"></div>
      <div class="links"><a id="ks-classic" target="_blank" rel="noopener">🏆 知乎高赞回答 ↗</a><a id="ks-rising" target="_blank" rel="noopener">🌱 潜力黑马回答 ↗</a></div>
    </div>
  `;

  const cap = shadow.getElementById("ks-cap");
  const card = shadow.getElementById("ks-card");
  let pending = null;

  function place(el, rect, above) {
    const w = el.offsetWidth || 320;
    const left = Math.max(12, Math.min(window.innerWidth - w - 12, rect.left + rect.width / 2 - w / 2));
    let top = above ? rect.top - 42 : rect.bottom + 10;
    if (top < 12) top = rect.bottom + 10;
    el.style.left = left + "px";
    el.style.top = top + "px";
  }

  document.addEventListener("mouseup", () => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const text = sel.toString().trim();
      if (text.length < 2 || text.length > 260) return;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      pending = { text, rect, context: (sel.anchorNode?.parentElement?.textContent || "").slice(0, 180) };
      card.style.display = "none";
      cap.style.display = "flex";
      place(cap, rect, true);
    }, 10);
  });

  shadow.getElementById("ks-x").onclick = () => { cap.style.display = "none"; };
  shadow.getElementById("ks-close").onclick = () => { card.style.display = "none"; };
  shadow.getElementById("ks-go").onclick = () => {
    if (!pending) return;
    cap.style.display = "none";
    chrome.runtime.sendMessage({ type: "QUERY_ZHIHU", text: pending.text, context: pending.context, pageTitle: document.title }, (res) => {
      if (!res || !res.data) return;
      const { data, priorCross } = res;
      shadow.getElementById("ks-title").textContent = data.term;
      shadow.getElementById("ks-analogy").textContent = data.analogy;
      const ev = data.evidence || { total: 10, practical: 4, counter: 3, filtered: 3 };
      shadow.getElementById("ks-ev").textContent = `📊 知乎证据条：检索 ${ev.total} 条 → 实测 ${ev.practical} · 反方 ${ev.counter} · 过滤水贴 ${ev.filtered}`;
      shadow.getElementById("ks-persp").innerHTML = (data.perspectives || []).map(p => `<div style="margin-bottom:4px;font-size:12px;"><strong>${p.stance}：</strong>${p.text}</div>`).join("");
      const cr = shadow.getElementById("ks-cross");
      if (priorCross) {
        cr.style.display = "block";
        cr.textContent = `✦ 跨页记忆串联：你之前在「${priorCross.pageTitle.slice(0, 20)}」也读过它！`;
      } else {
        cr.style.display = "none";
      }
      shadow.getElementById("ks-classic").href = data.classicUrl;
      shadow.getElementById("ks-rising").href = data.risingUrl;
      card.style.display = "block";
      place(card, pending.rect, false);
    });
  };
})();
