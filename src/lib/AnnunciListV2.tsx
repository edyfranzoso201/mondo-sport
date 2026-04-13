{/* ── Media Google Drive ──────────────────────────────────────── */}
{ann.mediaGoogleDrive && ann.mediaGoogleDrive.length > 0 && (
  <div style={{ marginTop: 10 }}>
    {ann.mediaGoogleDrive.map((m: any, i: number) => {
      const id = m.url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1]
        || m.url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]
      const embedUrl = id ? `https://drive.google.com/file/d/${id}/preview` : m.url
      const imgUrl = id ? `https://lh3.googleusercontent.com/d/${id}` : m.url

      return (
        <div key={i} style={{ marginBottom: 8, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          {m.titolo && (
            <div style={{ padding: '4px 10px', background: '#f3f4f6', fontSize: 12, fontWeight: 600, color: '#374151' }}>
              {m.tipo === 'video' ? '🎬' : m.tipo === 'immagine' ? '🖼️' : '📄'} {m.titolo}
            </div>
          )}
          {m.tipo === 'immagine' ? (
            <img
              src={imgUrl}
              alt={m.titolo || `Immagine ${i + 1}`}
              style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
          ) : (
            <iframe
              src={embedUrl}
              style={{ width: '100%', height: m.tipo === 'pdf' ? 320 : 220, border: 'none', display: 'block' }}
              allow="autoplay"
              title={m.titolo || `Media ${i + 1}`}
            />
          )}
        </div>
      )
    })}
  </div>
)}
{/* ─────────────────────────────────────────────────────────────── */}