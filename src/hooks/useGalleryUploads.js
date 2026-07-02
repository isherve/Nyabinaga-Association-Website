import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'nyabinaga_uploaded_images'
const MAX_DIMENSION = 1600 // px — resize large photos before storing
const JPEG_QUALITY = 0.82

// Reads a File, resizes/compresses it via a canvas, and returns a JPEG data URL.
// This keeps localStorage usage small (photos straight off a phone can be huge).
function fileToCompressedDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load image'))
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width)
          width = MAX_DIMENSION
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height)
          height = MAX_DIMENSION
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// Manages admin-uploaded gallery photos, persisted in the browser (localStorage).
// NOTE: uploads live only in the current browser until a backend is added.
export function useGalleryUploads() {
  const [uploads, setUploads] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUploads(JSON.parse(raw))
    } catch {
      /* ignore corrupt data */
    }
  }, [])

  const persist = useCallback((next) => {
    setUploads(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return true
    } catch {
      setError('Storage is full — some photos could not be saved in this browser.')
      return false
    }
  }, [])

  const addFiles = useCallback(
    async (fileList) => {
      setError('')
      const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
      if (files.length === 0) return
      const added = []
      for (const file of files) {
        try {
          const src = await fileToCompressedDataURL(file)
          added.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            src,
            alt: file.name.replace(/\.[^.]+$/, ''),
            uploaded: true,
          })
        } catch {
          setError('One or more files could not be processed.')
        }
      }
      if (added.length) persist([...added, ...uploads])
    },
    [uploads, persist],
  )

  const removeUpload = useCallback(
    (id) => persist(uploads.filter((u) => u.id !== id)),
    [uploads, persist],
  )

  const clearUploads = useCallback(() => persist([]), [persist])

  return { uploads, addFiles, removeUpload, clearUploads, error }
}
