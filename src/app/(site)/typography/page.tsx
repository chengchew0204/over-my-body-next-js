// Simple visual check for all EVO2 weights/styles.
export default function Page() {
  return (
    <main className="typography-page" style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <h1>Heading 1 - EVO2 Extreme 900</h1>
      <p>This is a paragraph with Regular 400 weight. The quick brown fox jumps over the lazy dog 1234567890 — 內文字級測試</p>
      
      <h2>Heading 2 - EVO2 Extreme 900</h2>
      <p>Another paragraph with Regular 400 weight. 保留既有版面比例，測試中文與英文混排效果。</p>
      
      <h3>Heading 3 - EVO2 Massive 700</h3>
      <p>Paragraph with Regular 400 weight. <em>This is italic text inheriting the parent weight.</em> 測試斜體效果。</p>
      
      <h4>Heading 4 - EVO2 Massive 700</h4>
      <p>Paragraph with Regular 400 weight. <a href="#">This is a link with Regular 400 weight</a> — 測試連結樣式。</p>
      
      <hr />
      
      <h2>Font Weight Examples</h2>
      <p style={{ fontWeight: 900 }}>Paragraph with Extreme 900 weight — 極黑測試</p>
      <p style={{ fontWeight: 700 }}>Paragraph with Massive 700 weight — 粗體測試</p>
      <p style={{ fontWeight: 400 }}>Paragraph with Regular 400 weight — 內文測試</p>
      
      <h3>Italic Styles</h3>
      <p style={{ fontWeight: 900, fontStyle: "italic" }}>Extreme 900 Italic — 極黑斜體</p>
      <p style={{ fontWeight: 700, fontStyle: "italic" }}>Massive 700 Italic — 粗體斜體</p>
      <p style={{ fontWeight: 400, fontStyle: "italic" }}>Regular 400 Italic — 內文斜體</p>
      
      <h3>Element Hierarchy Test</h3>
      <div>
        <h1>H1: Extreme 900</h1>
        <h2>H2: Extreme 900</h2>
        <h3>H3: Massive 700</h3>
        <h4>H4: Massive 700</h4>
        <p>P: Regular 400 — 跨我身體 OVER MY BODY</p>
        <a href="#">A: Regular 400 — 連結樣式測試</a>
      </div>
    </main>
  );
}
