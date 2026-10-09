import { useState } from 'react'
import api from '../api'

/**
 * ImageUpload — replaces the old "image URL" text input.
 * Picks a JPG/PNG file, uploads it to POST /api/upload and gives back the
 * public URL (e.g. /api/images/<id>) through onChange. Images are stored in
 * MongoDB, so they survive serverless redeploys.
 */
const ImageUpload = ({ value, onChange, label = 'Image', hint = 'JPG or PNG, up to 4 MB' }) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Only JPG and PNG images are allowed.')
      e.target.value = ''
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Image must be smaller than 4 MB.')
      e.target.value = ''
      return
    }

    const data = new FormData()
    data.append('image', file)
    setBusy(true)
    try {
      const { data: res } = await api.post('/upload', data)
      onChange(res.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <label>{label} <span className="hint">({hint})</span></label>
      <div className="upload">
        <input id={`file-${label}`} type="file" accept="image/jpeg,image/png,image/jpg" onChange={pick} />
        {value ? (
          <div className="preview">
            <img src={value} alt={label} />
            <div className="file-name">
              <small>✓ Uploaded successfully</small>
              {value}
              <div className="row" style={{ marginTop: 8 }}>
                <label htmlFor={`file-${label}`} style={{ margin: 0, color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}>
                  Replace
                </label>
                <button type="button" className="link-btn" onClick={() => onChange('')}>Remove</button>
              </div>
            </div>
          </div>
        ) : (
          <p className="label">
            Drag or <b>
              <label htmlFor={`file-${label}`} style={{ display: 'inline', margin: 0, cursor: 'pointer', color: 'var(--primary)' }}>
                choose an image
              </label>
            </b>{' '}
            from your device
          </p>
        )}
        {busy && <p className="label" style={{ marginTop: 8 }}>Uploading…</p>}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default ImageUpload
