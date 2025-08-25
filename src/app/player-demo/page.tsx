import AlbumPlayer from '@/components/player/AlbumPlayer';

export default function PlayerDemoPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      padding: '48px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1024px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 16px 0'
          }}>
            極簡深色風格播放器
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#cccccc',
            maxWidth: '512px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            採用極簡主義設計理念，深色系配色方案，提供純淨而精緻的音樂播放體驗。
            支援 HLS 串流播放、播放清單管理和流暢的動畫效果。
          </p>
        </div>

        <div style={{ display: 'grid', gap: '32px' }}>
          {/* 設計特色 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '32px',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
              margin: '0 0 24px 0'
            }}>
              設計特色
            </h2>
            <div style={{ display: 'grid', gap: '16px', color: '#cccccc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#ffffff',
                  borderRadius: '50%'
                }}></div>
                <span>極簡深色系設計，減少視覺干擾</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#ffffff',
                  borderRadius: '50%'
                }}></div>
                <span>白色播放按鈕，黑色背景，高對比度</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#ffffff',
                  borderRadius: '50%'
                }}></div>
                <span>簡化的進度條設計，白色填充效果</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#ffffff',
                  borderRadius: '50%'
                }}></div>
                <span>可展開的曲目列表，流暢動畫</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#ffffff',
                  borderRadius: '50%'
                }}></div>
                <span>HLS 串流播放支援</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#ffffff',
                  borderRadius: '50%'
                }}></div>
                <span>響應式設計，適配各種裝置</span>
              </div>
            </div>
          </div>

          {/* 實際播放器 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '32px',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
              margin: '0 0 24px 0'
            }}>
              播放器示範
            </h2>
            <p style={{
              color: '#cccccc',
              margin: '0 0 24px 0'
            }}>
              目前使用 <code style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                color: '#ffffff'
              }}>petals-of-nehan</code> 專輯進行示範（包含 7 首曲目）：
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <AlbumPlayer 
                albumId="petals-of-nehan" 
                className=""
              />
            </div>
          </div>

          {/* 使用說明 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '32px',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
              margin: '0 0 24px 0'
            }}>
              使用說明
            </h2>
            <div style={{ color: '#cccccc', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '16px' }}>
                <strong>基本用法：</strong>
              </p>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '16px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '14px',
                marginBottom: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
{`import AlbumPlayer from '@/components/player/AlbumPlayer';

<AlbumPlayer albumId="beni" />`}
              </pre>
              
              <p style={{ marginBottom: '16px' }}>
                <strong>設計理念：</strong>
              </p>
              <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                <li>極簡主義：去除不必要的視覺元素</li>
                <li>深色系：減少眼睛疲勞，突出內容</li>
                <li>高對比度：確保可讀性和可操作性</li>
                <li>流暢動畫：提供愉悅的交互體驗</li>
              </ul>
              
              <p style={{ marginBottom: '16px' }}>
                <strong>技術特色：</strong>
              </p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>直接使用 CloudFront URL，無需代理</li>
                <li>支援 HLS 加密串流播放</li>
                <li>自動處理解密金鑰請求</li>
                <li>響應式設計，適配各種裝置</li>
                <li>Framer Motion 流暢動畫</li>
                <li>CSS 模組化樣式管理</li>
              </ul>
            </div>
          </div>

          {/* 設計對比 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '32px',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
              margin: '0 0 24px 0'
            }}>
              設計改進
            </h2>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#ffffff',
                    margin: '0 0 12px 0'
                  }}>舊版設計</h3>
                  <ul style={{ color: '#cccccc', paddingLeft: '20px' }}>
                    <li>白色背景</li>
                    <li>複雜的視覺元素</li>
                    <li>多種顏色使用</li>
                    <li>較大的按鈕尺寸</li>
                  </ul>
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#ffffff',
                    margin: '0 0 12px 0'
                  }}>新版設計</h3>
                  <ul style={{ color: '#cccccc', paddingLeft: '20px' }}>
                    <li>深色背景</li>
                    <li>極簡視覺元素</li>
                    <li>黑白灰配色</li>
                    <li>精簡的按鈕尺寸</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
