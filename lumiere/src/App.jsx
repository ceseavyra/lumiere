import { useState, useRef, useCallback, useEffect } from "react";

// ─── AFFILIATE PRODUCTS ───────────────────────────────────────────────────────
const AFFILIATE_PRODUCTS = {
  "Gentle Foaming Cleanser": { name: "CeraVe Foaming Facial Cleanser", brand: "CeraVe", price: "$14.99", rating: 4.7, url: "https://www.amazon.com/dp/B01N1LL62W?tag=YOUR_TAG", badge: "Best Seller", badgeColor: "#4ecdc4" },
  "Vitamin C Serum": { name: "TruSkin Vitamin C Serum", brand: "TruSkin", price: "$19.99", rating: 4.5, url: "https://www.amazon.com/dp/B01M4MCUAF?tag=YOUR_TAG", badge: "#1 Choice", badgeColor: "#c9a96e" },
  "Lightweight Moisturizer": { name: "Neutrogena Hydro Boost Gel", brand: "Neutrogena", price: "$17.97", rating: 4.6, url: "https://www.amazon.com/dp/B00NR1YQHM?tag=YOUR_TAG", badge: "Top Rated", badgeColor: "#a29bfe" },
  "SPF 50 Sunscreen": { name: "EltaMD UV Clear SPF 46", brand: "EltaMD", price: "$39.00", rating: 4.8, url: "https://www.amazon.com/dp/B002MSN3QQ?tag=YOUR_TAG", badge: "Derm Fave", badgeColor: "#fd79a8" },
  "Oil Cleanser": { name: "DHC Deep Cleansing Oil", brand: "DHC", price: "$28.00", rating: 4.5, url: "https://www.amazon.com/dp/B001UE60F0?tag=YOUR_TAG", badge: "Cult Classic", badgeColor: "#e17055" },
  "Retinol Serum": { name: "RoC Retinol Correxion Serum", brand: "RoC", price: "$26.97", rating: 4.4, url: "https://www.amazon.com/dp/B003YJ0UXU?tag=YOUR_TAG", badge: "Anti-Aging", badgeColor: "#6c5ce7" },
  "Rich Night Cream": { name: "Olay Regenerist Night Recovery Cream", brand: "Olay", price: "$24.99", rating: 4.6, url: "https://www.amazon.com/dp/B07CTJKFPP?tag=YOUR_TAG", badge: "Best Value", badgeColor: "#00cec9" },
};

const CONCERN_COLORS = {
  "Acne": "#ff6b6b", "Oiliness": "#ffd93d", "Dryness": "#74b9ff", "Redness": "#ff7675",
  "Dark spots": "#a29bfe", "Hyperpigmentation": "#6c5ce7", "Fine lines": "#fd79a8",
  "Pores": "#00cec9", "Uneven texture": "#e17055", "Dark circles": "#636e72", "Sensitivity": "#fab1a0",
};

const SKIN_PROMPT = `You are a professional dermatologist and skincare expert. Analyze this facial photo carefully.
Respond ONLY with a valid JSON object — no markdown, no extra text:
{
  "skinType": "Oily | Dry | Combination | Normal | Sensitive",
  "skinTone": "Fair | Light | Medium | Tan | Deep",
  "undertone": "Cool | Warm | Neutral",
  "concerns": ["visible concern 1", "visible concern 2"],
  "hydrationLevel": "Low | Medium | High",
  "score": 72,
  "scoreLabel": "Good",
  "morningRoutine": [
    { "step": 1, "product": "Gentle Foaming Cleanser", "reason": "short reason" },
    { "step": 2, "product": "Vitamin C Serum", "reason": "short reason" },
    { "step": 3, "product": "Lightweight Moisturizer", "reason": "short reason" },
    { "step": 4, "product": "SPF 50 Sunscreen", "reason": "short reason" }
  ],
  "eveningRoutine": [
    { "step": 1, "product": "Oil Cleanser", "reason": "short reason" },
    { "step": 2, "product": "Retinol Serum", "reason": "short reason" },
    { "step": 3, "product": "Rich Night Cream", "reason": "short reason" }
  ],
  "keyIngredients": ["Niacinamide", "Hyaluronic Acid", "Retinol"],
  "avoidIngredients": ["Alcohol", "Fragrance"],
  "tip": "One personalized pro tip"
}`;

const PLANS = [
  { id: "free", name: "Free", price: "$0", period: "", scans: "3 scans / month", features: ["Basic skin profile", "Skin type & tone", "Top 2 concerns", "Share card"], locked: ["Full routine", "Ingredient guide", "Product links", "Pro tip"], cta: "Current Plan", highlight: false },
  { id: "pro", name: "Pro", price: "$6.99", period: "/month", scans: "Unlimited scans", features: ["Full skin profile", "Complete routines", "Ingredient guide", "Product recommendations", "Pro tip", "Share card"], locked: [], cta: "Upgrade to Pro", highlight: true },
  { id: "lifetime", name: "Lifetime", price: "$49", period: " one-time", scans: "Unlimited forever", features: ["Everything in Pro", "Lifetime access", "Future features"], locked: [], cta: "Get Lifetime Access", highlight: false },
];

// ─── SHARE CARD CANVAS ────────────────────────────────────────────────────────
// Draws a 1080×1920 Instagram Stories-sized card to a canvas
function drawShareCard(canvas, analysis, userImage) {
  const W = 1080, H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0a0a0f");
  bg.addColorStop(0.5, "#110f18");
  bg.addColorStop(1, "#0a0a0f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle grain overlay
  for (let i = 0; i < 8000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.018})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }

  // Decorative corner arcs
  ctx.strokeStyle = "rgba(201,169,110,0.12)";
  ctx.lineWidth = 1;
  [[60, 60, 80], [W - 60, 60, 80], [60, H - 60, 80], [W - 60, H - 60, 80]].forEach(([x, y, r]) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, Math.PI * 2); ctx.stroke();
  });

  // Top border line
  const topLine = ctx.createLinearGradient(0, 0, W, 0);
  topLine.addColorStop(0, "transparent");
  topLine.addColorStop(0.5, "#c9a96e");
  topLine.addColorStop(1, "transparent");
  ctx.strokeStyle = topLine;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(W, 2); ctx.stroke();

  // LUMIÈRE wordmark
  ctx.fillStyle = "#c9a96e";
  ctx.font = "300 72px 'Georgia', serif";
  ctx.letterSpacing = "12px";
  ctx.textAlign = "center";
  ctx.fillText("LUMIÈRE", W / 2, 130);

  ctx.fillStyle = "rgba(201,169,110,0.45)";
  ctx.font = "300 22px monospace";
  ctx.fillText("AI SKIN INTELLIGENCE", W / 2, 172);

  // Score colour
  const scoreColor = analysis.score >= 80 ? "#4ecdc4" : analysis.score >= 60 ? "#f9ca24" : "#ff6b6b";

  // User photo (circular crop) — centred below header
  const imgY = 220, imgSize = 420, imgRadius = imgSize / 2;
  const imgCX = W / 2, imgCY = imgY + imgSize / 2 + 20;
  if (userImage) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(imgCX, imgCY, imgRadius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(userImage, imgCX - imgRadius, imgCY - imgRadius, imgSize, imgSize);
    ctx.restore();
    // ring around photo
    ctx.strokeStyle = scoreColor;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(imgCX, imgCY, imgRadius + 10, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(201,169,110,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(imgCX, imgCY, imgRadius + 24, 0, Math.PI * 2); ctx.stroke();
  }

  // Score ring (big) — below photo
  const ringY = imgCY + imgRadius + 80;
  const ringR = 160;
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 18;
  ctx.beginPath(); ctx.arc(W / 2, ringY, ringR, 0, Math.PI * 2); ctx.stroke();

  const pct = analysis.score / 100;
  ctx.strokeStyle = scoreColor;
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(W / 2, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
  ctx.stroke();

  // Score number
  ctx.fillStyle = scoreColor;
  ctx.font = "300 110px 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.fillText(analysis.score, W / 2, ringY + 38);
  ctx.fillStyle = "rgba(201,169,110,0.5)";
  ctx.font = "300 26px monospace";
  ctx.fillText("SKIN SCORE", W / 2, ringY + 82);

  // Score label badge
  ctx.fillStyle = `${scoreColor}22`;
  ctx.strokeStyle = `${scoreColor}55`;
  ctx.lineWidth = 1;
  roundRect(ctx, W / 2 - 110, ringY + 102, 220, 52, 26);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = scoreColor;
  ctx.font = "400 28px monospace";
  ctx.fillText(analysis.scoreLabel?.toUpperCase() || "GOOD", W / 2, ringY + 135);

  // Divider
  const divY = ringY + 190;
  const div = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
  div.addColorStop(0, "transparent"); div.addColorStop(0.5, "rgba(201,169,110,0.4)"); div.addColorStop(1, "transparent");
  ctx.strokeStyle = div; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W * 0.1, divY); ctx.lineTo(W * 0.9, divY); ctx.stroke();

  // Skin stats grid — 2x2
  const stats = [
    ["SKIN TYPE", analysis.skinType],
    ["SKIN TONE", analysis.skinTone],
    ["UNDERTONE", analysis.undertone],
    ["HYDRATION", analysis.hydrationLevel],
  ];
  const statStartY = divY + 40;
  const cellW = 440, cellH = 110, colGap = W / 2;
  stats.forEach(([label, value], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = col === 0 ? W / 2 - cellW / 2 - 20 : W / 2 + 20;
    const cy = statStartY + row * (cellH + 16);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.strokeStyle = "rgba(201,169,110,0.12)";
    ctx.lineWidth = 1;
    roundRect(ctx, cx, cy, cellW, cellH, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(201,169,110,0.5)";
    ctx.font = "400 20px monospace";
    ctx.textAlign = "left";
    ctx.fillText(label, cx + 20, cy + 32);
    ctx.fillStyle = "#f0ece4";
    ctx.font = "300 36px 'Georgia', serif";
    ctx.fillText(value || "—", cx + 20, cy + 80);
  });

  // Concerns section
  const concY = statStartY + 2 * (cellH + 16) + 40;
  ctx.fillStyle = "rgba(201,169,110,0.6)";
  ctx.font = "400 22px monospace";
  ctx.textAlign = "center";
  ctx.fillText("SKIN CONCERNS", W / 2, concY);

  // Concern pills
  const concerns = analysis.concerns || [];
  let pillX = 80, pillY = concY + 30;
  const pillH = 60, pillPad = 28;
  ctx.font = "400 24px monospace";
  concerns.forEach((c) => {
    const tw = ctx.measureText(c).width;
    const pillW = tw + pillPad * 2;
    if (pillX + pillW > W - 80) { pillX = 80; pillY += pillH + 16; }
    const col = CONCERN_COLORS[c] || "#c9a96e";
    ctx.fillStyle = col + "22";
    ctx.strokeStyle = col + "66";
    ctx.lineWidth = 1;
    roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col;
    ctx.textAlign = "left";
    ctx.fillText(c, pillX + pillPad, pillY + 40);
    pillX += pillW + 16;
  });

  // Key ingredients strip
  const ingY = pillY + pillH + 60;
  ctx.fillStyle = "rgba(78,205,196,0.08)";
  ctx.strokeStyle = "rgba(78,205,196,0.25)";
  ctx.lineWidth = 1;
  roundRect(ctx, 80, ingY, W - 160, 130, 16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#4ecdc4";
  ctx.font = "400 20px monospace";
  ctx.textAlign = "center";
  ctx.fillText("✓ KEY INGREDIENTS FOR YOUR SKIN", W / 2, ingY + 38);
  ctx.fillStyle = "#cce8e7";
  ctx.font = "300 30px 'Georgia', serif";
  ctx.fillText((analysis.keyIngredients || []).join("  ·  "), W / 2, ingY + 96);

  // Bottom CTA
  const ctaY = H - 180;
  const ctaGrad = ctx.createLinearGradient(160, ctaY, W - 160, ctaY);
  ctaGrad.addColorStop(0, "#c9a96e"); ctaGrad.addColorStop(1, "#a0783e");
  ctx.fillStyle = ctaGrad;
  roundRect(ctx, 160, ctaY, W - 320, 88, 10); ctx.fill();
  ctx.fillStyle = "#0a0a0f";
  ctx.font = "500 30px monospace";
  ctx.textAlign = "center";
  ctx.fillText("GET YOUR FREE SKIN ANALYSIS", W / 2, ctaY + 53);

  ctx.fillStyle = "rgba(201,169,110,0.35)";
  ctx.font = "300 22px monospace";
  ctx.fillText("lumiere-skin.com", W / 2, H - 56);

  // Bottom border
  const btmLine = ctx.createLinearGradient(0, 0, W, 0);
  btmLine.addColorStop(0, "transparent"); btmLine.addColorStop(0.5, "#c9a96e"); btmLine.addColorStop(1, "transparent");
  ctx.strokeStyle = btmLine; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, H - 2); ctx.lineTo(W, H - 2); ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── SHARE MODAL ──────────────────────────────────────────────────────────────
function ShareModal({ analysis, userImage, onClose }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !analysis) return;
    const img = new window.Image();
    img.onload = () => {
      drawShareCard(canvasRef.current, analysis, img);
      setRendered(true);
    };
    img.onerror = () => {
      drawShareCard(canvasRef.current, analysis, null);
      setRendered(true);
    };
    img.crossOrigin = "anonymous";
    img.src = userImage;
  }, [analysis, userImage]);

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "my-skin-score-lumiere.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://lumiere-skin.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, padding: 20, backdropFilter: "blur(12px)"
    }}>
      <div style={{
        background: "#0e0e14", border: "1px solid rgba(201,169,110,0.2)",
        borderRadius: 20, maxWidth: 520, width: "100%", padding: "32px 28px",
        position: "relative", maxHeight: "90vh", overflowY: "auto"
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 18, background: "none", border: "none", color: "#5a5550", fontSize: 20, cursor: "pointer" }}>✕</button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.3em", color: "#c9a96e", marginBottom: 8 }}>SHARE YOUR RESULTS</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, margin: 0 }}>
            Your Skin Score Card
          </h2>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a5550", marginTop: 8 }}>
            Download and post to Instagram Stories
          </p>
        </div>

        {/* Canvas preview — scaled down for display */}
        <div style={{
          borderRadius: 12, overflow: "hidden", marginBottom: 20,
          border: "1px solid rgba(201,169,110,0.15)",
          background: "#080810",
          display: "flex", justifyContent: "center"
        }}>
          <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 280, display: "block" }} />
        </div>

        {!rendered && (
          <div style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a5550", marginBottom: 16 }}>
            <span style={{ animation: "pulse 1.5s infinite" }}>Generating your card...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Download */}
          <button onClick={download} disabled={!rendered} style={{
            background: rendered ? "linear-gradient(135deg, #c9a96e, #a0783e)" : "rgba(255,255,255,0.05)",
            border: "none", borderRadius: 8, padding: "14px",
            color: rendered ? "#0a0a0f" : "#3a3530",
            fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.15em",
            cursor: rendered ? "pointer" : "not-allowed", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
            <span>⬇</span> DOWNLOAD FOR INSTAGRAM STORIES
          </button>

          {/* Share row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <a href={`https://twitter.com/intent/tweet?text=My+skin+score+is+${analysis?.score}%2F100+✦+Get+yours+at+lumiere-skin.com`}
              target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", background: "rgba(29,161,242,0.1)", border: "1px solid rgba(29,161,242,0.25)",
                borderRadius: 8, padding: "12px", color: "#1da1f2",
                fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer"
              }}>𝕏 SHARE ON X</button>
            </a>
            <button onClick={copyLink} style={{
              background: copied ? "rgba(78,205,196,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${copied ? "rgba(78,205,196,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8, padding: "12px",
              color: copied ? "#4ecdc4" : "#8a8580",
              fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer"
            }}>{copied ? "✓ COPIED!" : "⎘ COPY LINK"}</button>
          </div>
        </div>

        {/* Instagram instructions */}
        <div style={{
          marginTop: 20, background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.12)",
          borderRadius: 10, padding: "16px 18px"
        }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c9a96e", letterSpacing: "0.15em", marginBottom: 10 }}>HOW TO POST TO INSTAGRAM</div>
          {["1. Download the image above", "2. Open Instagram → tap +  → Story", "3. Select the downloaded image", "4. Add your own caption & post!"].map((step, i) => (
            <div key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6a6560", padding: "4px 0", lineHeight: 1.6 }}>{step}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAYWALL MODAL ────────────────────────────────────────────────────────────
function PaywallModal({ onClose, onUnlock }) {
  const [selected, setSelected] = useState("pro");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24, backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#0e0e14", border: "1px solid rgba(201,169,110,0.25)", borderRadius: 20, maxWidth: 640, width: "100%", padding: "40px 36px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", color: "#5a5550", fontSize: 22, cursor: "pointer" }}>✕</button>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.3em", color: "#c9a96e", marginBottom: 10 }}>UNLOCK FULL ANALYSIS</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, margin: "0 0 10px" }}>Your skin deserves the full picture</h2>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#5a5550", margin: 0 }}>Complete routine · Ingredient guide · Product picks · Unlimited scans</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
          {PLANS.map(plan => (
            <div key={plan.id} onClick={() => plan.id !== "free" && setSelected(plan.id)} style={{
              border: selected === plan.id ? "1px solid #c9a96e" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: "20px 16px", cursor: plan.id !== "free" ? "pointer" : "default",
              background: selected === plan.id ? "rgba(201,169,110,0.07)" : "rgba(255,255,255,0.02)",
              transition: "all 0.2s", position: "relative", opacity: plan.id === "free" ? 0.5 : 1,
            }}>
              {plan.highlight && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #c9a96e, #a0783e)", color: "#0a0a0f", fontFamily: "'DM Mono', monospace", fontSize: 9, padding: "3px 12px", borderRadius: 10, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>MOST POPULAR</div>}
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#5a5550", letterSpacing: "0.2em", marginBottom: 8 }}>{plan.name.toUpperCase()}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: plan.id === "free" ? "#5a5550" : "#c9a96e", fontWeight: 300 }}>{plan.price}<span style={{ fontSize: 14, color: "#5a5550" }}>{plan.period}</span></div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#4a4540", marginTop: 8 }}>{plan.scans}</div>
              <div style={{ marginTop: 14 }}>{plan.features.map(f => (<div key={f} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a8580", padding: "3px 0", display: "flex", gap: 6 }}><span style={{ color: "#4ecdc4" }}>✓</span>{f}</div>))}</div>
            </div>
          ))}
        </div>
        <button onClick={() => onUnlock(selected)} style={{
          width: "100%", padding: "16px", borderRadius: 8, border: "none",
          background: "linear-gradient(135deg, #c9a96e 0%, #a0783e 100%)",
          color: "#0a0a0f", fontFamily: "'DM Mono', monospace", fontSize: 13,
          letterSpacing: "0.2em", cursor: "pointer", fontWeight: 600,
        }}>{PLANS.find(p => p.id === selected)?.cta?.toUpperCase()}</button>
        <p style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3a3530", marginTop: 14 }}>
          🔒 Secure payment · Cancel anytime · 7-day money back guarantee
        </p>
      </div>
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <span style={{ color: "#c9a96e", fontSize: 11 }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
      <span style={{ color: "#5a5550", marginLeft: 4, fontFamily: "'DM Mono', monospace" }}>{rating}</span>
    </span>
  );
}

function AffiliateCard({ productKey }) {
  const p = AFFILIATE_PRODUCTS[productKey];
  if (!p) return null;
  return (
    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      <div style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 10, padding: "12px 14px", marginTop: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,169,110,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,169,110,0.04)"; }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            {p.badge && <span style={{ background: `${p.badgeColor}22`, border: `1px solid ${p.badgeColor}55`, color: p.badgeColor, fontFamily: "'DM Mono', monospace", fontSize: 8, padding: "2px 6px", borderRadius: 10 }}>{p.badge}</span>}
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#5a5550" }}>{p.brand.toUpperCase()}</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: "#e8e0d4", marginBottom: 3 }}>{p.name}</div>
          <StarRating rating={p.rating} />
        </div>
        <div style={{ textAlign: "right", marginLeft: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: "#c9a96e", fontWeight: 600 }}>{p.price}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: "#0a0a0f", background: "#c9a96e", padding: "2px 8px", borderRadius: 3, marginTop: 4 }}>SHOP →</div>
        </div>
      </div>
    </a>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SkincareAnalyzer() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [scansUsed, setScansUsed] = useState(0);
  const [shareAnimation, setShareAnimation] = useState(false);
  const FREE_SCAN_LIMIT = 3;
  const fileInputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(URL.createObjectURL(file));
    setAnalysis(null); setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImageBase64(e.target.result.split(",")[1]);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); };

  const analyze = async () => {
    if (!imageBase64) return;
    if (!isPro && scansUsed >= FREE_SCAN_LIMIT) { setShowPaywall(true); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
            { type: "text", text: SKIN_PROMPT }
          ]}]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setAnalysis(parsed);
      setScansUsed(n => n + 1);
    } catch { setError("Could not analyze the image. Please try a clearer photo of your face."); }
    setLoading(false);
  };

  const scoreColor = analysis ? (analysis.score >= 80 ? "#4ecdc4" : analysis.score >= 60 ? "#f9ca24" : "#ff6b6b") : "#4ecdc4";
  const scansLeft = FREE_SCAN_LIMIT - scansUsed;

  const handleShare = () => {
    setShareAnimation(true);
    setTimeout(() => { setShareAnimation(false); setShowShare(true); }, 400);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f0ece4", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .upload-zone:hover { border-color: #c9a96e !important; background: rgba(201,169,110,0.05) !important; }
        .gold-btn { background: linear-gradient(135deg, #c9a96e, #a0783e); border: none; cursor: pointer; transition: all 0.3s; letter-spacing: 0.2em; }
        .gold-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(201,169,110,0.4); }
        .gold-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .share-btn { background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); border: none; cursor: pointer; transition: all 0.3s; letter-spacing: 0.15em; }
        .share-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(253,29,29,0.35); }
        .routine-card { transition: all 0.2s; }
        .routine-card:hover { background: rgba(201,169,110,0.08) !important; transform: translateX(4px); }
        .fade-in { animation: fadeIn 0.6s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .tag { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin: 3px; font-family: 'DM Mono', monospace; }
        .locked-blur { filter: blur(5px); pointer-events: none; user-select: none; opacity: 0.4; }
        .share-pop { animation: sharePop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes sharePop { 0%{transform:scale(1)} 50%{transform:scale(0.95)} 100%{transform:scale(1)} }
        .ig-gradient { background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); }
      `}</style>

      {showShare && <ShareModal analysis={analysis} userImage={image} onClose={() => setShowShare(false)} />}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onUnlock={(plan) => { setIsPro(true); setShowPaywall(false); }} />}

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(201,169,110,0.2)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(201,169,110,0.03)" }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, color: "#c9a96e", letterSpacing: "0.05em" }}>LUMIÈRE</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.3em", color: "#4a4540", marginTop: 2 }}>AI SKIN INTELLIGENCE</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isPro && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: scansLeft <= 1 ? "#ff6b6b" : "#5a5550" }}>{scansLeft} FREE SCAN{scansLeft !== 1 ? "S" : ""} LEFT</div>}
          {isPro
            ? <div style={{ background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)", color: "#c9a96e", fontFamily: "'DM Mono', monospace", fontSize: 10, padding: "5px 14px", borderRadius: 20 }}>✦ PRO</div>
            : <button className="gold-btn" onClick={() => setShowPaywall(true)} style={{ color: "#0a0a0f", padding: "8px 18px", borderRadius: 4, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>UPGRADE</button>
          }
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px" }}>

        {/* Hero */}
        {!analysis && (
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px, 6vw, 60px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 14 }}>
              Your skin,<br /><em style={{ color: "#c9a96e" }}>understood.</em>
            </h1>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#5a5550", letterSpacing: "0.1em" }}>
              Upload a selfie · Get AI analysis · Share your score
            </p>
          </div>
        )}

        {/* Upload */}
        <div style={{ display: "grid", gridTemplateColumns: image ? "1fr 1fr" : "1fr", gap: 20, marginBottom: 24 }}>
          <div className="upload-zone" onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            style={{ border: dragOver ? "1px solid #c9a96e" : "1px solid rgba(201,169,110,0.2)", borderRadius: 12, padding: 40, textAlign: "center", cursor: "pointer", background: dragOver ? "rgba(201,169,110,0.05)" : "rgba(255,255,255,0.02)", minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => processFile(e.target.files[0])} />
            <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.5 }}>✦</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#c9a96e", marginBottom: 6 }}>{image ? "Change Photo" : "Upload Your Photo"}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a4540", letterSpacing: "0.15em" }}>DRAG & DROP OR TAP TO BROWSE</div>
          </div>
          {image && (
            <div style={{ borderRadius: 12, overflow: "hidden", minHeight: 220, position: "relative" }}>
              <img src={image} alt="Your photo" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,15,0.5) 0%, transparent 50%)" }} />
            </div>
          )}
        </div>

        {image && !analysis && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <button className="gold-btn" disabled={loading} onClick={analyze} style={{ color: "#0a0a0f", padding: "15px 48px", borderRadius: 4, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
              {loading ? <span className="pulse">ANALYSING YOUR SKIN...</span> : "BEGIN ANALYSIS"}
            </button>
          </div>
        )}

        {error && <div style={{ textAlign: "center", color: "#ff6b6b", fontFamily: "'DM Mono', monospace", fontSize: 11, marginBottom: 20 }}>{error}</div>}

        {/* ── RESULTS ── */}
        {analysis && (
          <div className="fade-in">

            {/* ✦ SHARE CARD — prominent placement right at top of results */}
            <div style={{
              background: "linear-gradient(135deg, rgba(131,58,180,0.12), rgba(253,29,29,0.08), rgba(252,176,69,0.08))",
              border: "1px solid rgba(252,176,69,0.25)",
              borderRadius: 16, padding: "24px 28px", marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
              flexWrap: "wrap"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", fontSize: 14 }}>📸</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", color: "#fcb045" }}>SHARE YOUR SKIN SCORE</div>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, marginBottom: 4 }}>
                  You scored <span style={{ color: scoreColor, fontWeight: 600 }}>{analysis.score}/100</span> — share it!
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6a6560" }}>
                  Download a beautiful card for Instagram Stories
                </div>
              </div>
              <button
                className={`share-btn ${shareAnimation ? "share-pop" : ""}`}
                onClick={handleShare}
                style={{ color: "#fff", padding: "14px 28px", borderRadius: 8, fontSize: 12, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                📲 CREATE SHARE CARD
              </button>
            </div>

            {/* Score + Profile */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.15)", borderRadius: 16, padding: 24, marginBottom: 20, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <svg width={110} height={110} viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r="55" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="65" cy="65" r="55" fill="none" stroke={scoreColor} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 55}`}
                    strokeDashoffset={`${2 * Math.PI * 55 * (1 - analysis.score / 100)}`}
                    strokeLinecap="round" transform="rotate(-90 65 65)"
                    style={{ transition: "stroke-dashoffset 1.5s ease" }} />
                  <text x="65" y="60" textAnchor="middle" fill={scoreColor} fontSize="28" fontFamily="'Cormorant Garamond', serif" fontWeight="300">{analysis.score}</text>
                  <text x="65" y="78" textAnchor="middle" fill="#6b6560" fontSize="10" fontFamily="'DM Mono', monospace" letterSpacing="2">{analysis.scoreLabel?.toUpperCase()}</text>
                </svg>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#4a4540", letterSpacing: "0.15em", marginTop: 2 }}>SKIN SCORE</div>
              </div>
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, marginBottom: 14, color: "#c9a96e" }}>Your Skin Profile</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["Skin Type", analysis.skinType], ["Skin Tone", analysis.skinTone], ["Undertone", analysis.undertone], ["Hydration", analysis.hydrationLevel]].map(([label, value]) => (
                    <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "9px 12px" }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#4a4540", letterSpacing: "0.2em", marginBottom: 2 }}>{label.toUpperCase()}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Concerns */}
            {analysis.concerns?.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.15)", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.25em", color: "#c9a96e", marginBottom: 12 }}>SKIN CONCERNS DETECTED</div>
                <div>{analysis.concerns.map((c) => (<span key={c} className="tag" style={{ background: `${CONCERN_COLORS[c] || "#c9a96e"}18`, border: `1px solid ${CONCERN_COLORS[c] || "#c9a96e"}40`, color: CONCERN_COLORS[c] || "#c9a96e" }}>{c}</span>))}</div>
              </div>
            )}

            {/* Routines */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {[{ title: "Morning Routine", emoji: "☀️", steps: analysis.morningRoutine }, { title: "Evening Routine", emoji: "🌙", steps: analysis.eveningRoutine }].map(({ title, emoji, steps }, ri) => (
                <div key={title} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,169,110,0.15)", borderRadius: 16, padding: "22px" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.25em", color: "#c9a96e", marginBottom: 16 }}>{emoji} {title.toUpperCase()}</div>
                  {steps?.map((s, i) => {
                    const isLocked = !isPro && ri === 1 && i >= 1;
                    return (
                      <div key={s.step} className={isLocked ? "locked-blur" : ""}>
                        <div className="routine-card" style={{ display: "flex", gap: 10, padding: "9px", borderRadius: 8, background: "rgba(255,255,255,0.01)", marginBottom: 4, border: "1px solid transparent" }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c9a96e" }}>{s.step}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, marginBottom: 1 }}>{s.product}</div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#5a5550", lineHeight: 1.5 }}>{s.reason}</div>
                          </div>
                        </div>
                        {!isLocked && <AffiliateCard productKey={s.product} />}
                      </div>
                    );
                  })}
                  {!isPro && ri === 1 && <button className="gold-btn" onClick={() => setShowPaywall(true)} style={{ width: "100%", marginTop: 10, padding: "9px", borderRadius: 6, fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#0a0a0f" }}>UNLOCK FULL ROUTINE ✦</button>}
                </div>
              ))}
            </div>

            {/* Ingredients */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div className={!isPro ? "locked-blur" : ""} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "rgba(78,205,196,0.04)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 16, padding: "20px 24px" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.25em", color: "#4ecdc4", marginBottom: 10 }}>✓ KEY INGREDIENTS</div>
                  {analysis.keyIngredients?.map(i => (<div key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, padding: "5px 0", borderBottom: "1px solid rgba(78,205,196,0.1)", color: "#cce8e7" }}>{i}</div>))}
                </div>
                <div style={{ background: "rgba(255,107,107,0.04)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 16, padding: "20px 24px" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.25em", color: "#ff6b6b", marginBottom: 10 }}>✗ AVOID</div>
                  {analysis.avoidIngredients?.map(i => (<div key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, padding: "5px 0", borderBottom: "1px solid rgba(255,107,107,0.1)", color: "#ffd4d4" }}>{i}</div>))}
                </div>
              </div>
              {!isPro && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#f0ece4" }}>🔒 Ingredient Guide is Pro</div>
                  <button className="gold-btn" onClick={() => setShowPaywall(true)} style={{ color: "#0a0a0f", padding: "10px 24px", borderRadius: 4, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>UNLOCK FOR $6.99/MO</button>
                </div>
              )}
            </div>

            {/* Pro Tip */}
            {analysis.tip && (
              <div style={{ position: "relative", marginBottom: 24 }}>
                <div className={!isPro ? "locked-blur" : ""} style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.08), rgba(201,169,110,0.03))", border: "1px solid rgba(201,169,110,0.25)", borderRadius: 16, padding: "24px 28px" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.25em", color: "#c9a96e", marginBottom: 6 }}>PRO TIP</div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 300, lineHeight: 1.6, fontStyle: "italic", color: "#e8e0d4" }}>"{analysis.tip}"</p>
                </div>
                {!isPro && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexDirection: "column" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#f0ece4" }}>🔒 Pro Tip is Pro</div>
                    <button className="gold-btn" onClick={() => setShowPaywall(true)} style={{ color: "#0a0a0f", padding: "9px 24px", borderRadius: 4, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>UNLOCK NOW</button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom share + upsell */}
            {!isPro && (
              <div style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.1), rgba(160,120,62,0.05))", border: "1px solid rgba(201,169,110,0.3)", borderRadius: 16, padding: "24px 28px", textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, marginBottom: 6, color: "#c9a96e" }}>Unlock your full skin potential</div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a8580", marginBottom: 16, lineHeight: 1.8 }}>Complete routines · Ingredient guide · Product picks · Unlimited scans</p>
                <button className="gold-btn" onClick={() => setShowPaywall(true)} style={{ color: "#0a0a0f", padding: "13px 36px", borderRadius: 4, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>UPGRADE TO PRO — $6.99/MO</button>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a4540", marginTop: 8 }}>Or $49 lifetime · 7-day money back guarantee</div>
              </div>
            )}

            {/* Bottom actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="share-btn" onClick={handleShare} style={{ color: "#fff", padding: "13px 28px", borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                📲 SHARE TO INSTAGRAM
              </button>
              <button className="gold-btn" onClick={() => { setImage(null); setImageBase64(null); setAnalysis(null); }} style={{ color: "#0a0a0f", padding: "13px 28px", borderRadius: 4, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                ANALYSE ANOTHER PHOTO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
