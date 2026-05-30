import { useState, useRef } from "react";

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
    setResult(null);
    setError(null);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = image.split(",")[1];
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
              { type: "text", text: `You are a skincare expert. Analyze this face photo and respond ONLY with a JSON object, no markdown:
{
  "skinType": "Oily/Dry/Combination/Normal/Sensitive",
  "skinTone": "Fair/Light/Medium/Tan/Deep",
  "concerns": ["concern1", "concern2"],
  "score": 75,
  "routine": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "tip": "One personalized tip"
}` }
            ]
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
    } catch (e) {
      setError("Something went wrong. Please try again.");
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Skin Analyzer</h1>

      <div onClick={() => fileInputRef.current?.click()}
        style={{ border: "2px dashed #ccc", borderRadius: 12, padding: 40, textAlign: "center", cursor: "pointer", marginBottom: 16 }}>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])} />
        {image ? <img src={image} alt="uploaded" style={{ maxWidth: "100%", borderRadius: 8 }} /> : <p>Tap to upload a photo of your face</p>}
      </div>

      {image && !loading && (
        <button onClick={analyze}
          style={{ width: "100%", padding: 14, background: "#000", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}>
          Analyze My Skin
        </button>
      )}

      {loading && <p style={{ textAlign: "center" }}>Analyzing your skin...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24, background: "#f9f9f9", borderRadius: 12, padding: 20 }}>
          <h2>Your Results</h2>
          <p><strong>Skin Type:</strong> {result.skinType}</p>
          <p><strong>Skin Tone:</strong> {result.skinTone}</p>
          <p><strong>Score:</strong> {result.score}/100</p>
          <p><strong>Concerns:</strong> {result.concerns?.join(", ")}</p>
          <h3>Your Routine</h3>
          {result.routine?.map((step, i) => <p key={i}>{step}</p>)}
          <h3>Pro Tip</h3>
          <p>{result.tip}</p>
        </div>
      )}
    </div>
  );
}