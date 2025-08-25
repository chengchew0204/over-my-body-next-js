import AlbumPlayer from '@/components/player/AlbumPlayer';

export default function PlayerDemoPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
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
            color: '#111827',
            margin: '0 0 16px 0'
          }}>
            專輯播放器示範
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '512px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            這是一個優雅的專輯播放器，支援 HLS 串流播放、播放清單管理和流暢的動畫效果。
            遵循 less-is-more 設計理念，提供純淨而精緻的使用體驗。
          </p>
        </div>

        <div style={{ display: 'grid', gap: '32px' }}>
          {/* 播放器示範 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            padding: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 24px 0'
            }}>
              播放器功能
            </h2>
            <div style={{ display: 'grid', gap: '16px', color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%'
                }}></div>
                <span>HLS 串流播放支援（hls.js + Safari 原生）</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%'
                }}></div>
                <span>播放進度條（可拖拽調整）</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%'
                }}></div>
                <span>上一首 / 下一首切換</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%'
                }}></div>
                <span>播放清單管理（可展開/收合）</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%'
                }}></div>
                <span>Framer Motion 流暢動畫</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%'
                }}></div>
                <span>響應式設計（手機版簡化）</span>
              </div>
            </div>
          </div>

          {/* 實際播放器 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            padding: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 24px 0'
            }}>
              播放器示範
            </h2>
                         <p style={{
               color: '#6b7280',
               margin: '0 0 24px 0'
             }}>
               目前使用 <code style={{
                 background: '#f3f4f6',
                 padding: '4px 8px',
                 borderRadius: '4px',
                 fontFamily: 'monospace'
               }}>petals-of-nehan</code> 專輯進行示範（包含 7 首曲目）：
             </p>
            
                         <AlbumPlayer 
               albumId="petals-of-nehan" 
               className="max-w-md mx-auto"
             />
          </div>

          {/* 使用說明 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            padding: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 24px 0'
            }}>
              使用說明
            </h2>
            <div style={{ color: '#6b7280', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '16px' }}>
                <strong>基本用法：</strong>
              </p>
              <pre style={{
                background: '#f3f4f6',
                padding: '16px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
{`import AlbumPlayer from '@/components/player/AlbumPlayer';

<AlbumPlayer albumId="beni" />`}
              </pre>
              
              <p style={{ marginBottom: '16px' }}>
                <strong>API 端點：</strong>
              </p>
              <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                <li><code>/api/tracks/by-album/{'{albumId}'}</code> - 獲取專輯和曲目資料</li>
                <li><code>/api/hls/key?track={'{trackId}'}</code> - 獲取 HLS 解密金鑰</li>
              </ul>
              
              <p style={{ marginBottom: '16px' }}>
                <strong>技術特色：</strong>
              </p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>直接使用 CloudFront URL，無需代理</li>
                <li>支援 HLS 加密串流播放</li>
                <li>自動處理解密金鑰請求</li>
                <li>響應式設計，適配各種裝置</li>
                <li>流暢的 Framer Motion 動畫</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
