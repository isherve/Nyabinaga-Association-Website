import { useCallback, useEffect, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { galleryImages, featuredImages } from '../content/site'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { useGalleryUploads } from '../hooks/useGalleryUploads'
import { Close, ArrowRight, Upload, Trash, Download } from '../components/Icons'

const galleryDownloadBtn =
  'rounded-full bg-forest-600/85 p-2.5 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-forest-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60'
const galleryCloseBtn =
  'rounded-full bg-red-600/85 p-2.5 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60'

export default function Gallery() {
  const { isAdmin } = useAuth()
  const { t } = useSettings()
  const { uploads, addFiles, removeUpload, error } = useGalleryUploads()
  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)

  const allImages = [...uploads, ...galleryImages]

  // Category filter (All / Recently added).
  const [filter, setFilter] = useState('all')
  const filters = [
    { id: 'all', label: t('gallery.filter.all') },
    { id: 'recent', label: t('gallery.filter.recent') },
  ]
  const images =
    filter === 'recent' ? allImages.filter((img) => img.recent || img.uploaded) : allImages

  const [index, setIndex] = useState(null)
  const isOpen = index !== null

  // Show a limited batch first; "View more" reveals the rest in steps.
  const INITIAL_COUNT = 12
  const STEP = 12
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)
  const visibleImages = images.slice(0, visibleCount)
  const hasMore = visibleCount < images.length
  const canCollapse = visibleCount > INITIAL_COUNT

  // Reset how many are shown whenever the filter changes.
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT)
  }, [filter])

  const close = useCallback(() => setIndex(null), [])
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % images.length)), [images.length])
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length],
  )

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, close, next, prev])

  const handleFiles = async (fileList) => {
    if (!fileList?.length) return
    setBusy(true)
    await addFiles(fileList)
    setBusy(false)
  }

  const downloadImage = useCallback(async (img) => {
    if (!img?.src) return
    const guessName = () => {
      const fromPath = img.src.split('/').pop()?.split('?')[0]
      if (fromPath && fromPath.includes('.') && !img.src.startsWith('data:')) return fromPath
      return `nyabinaga-${img.id || Date.now()}.jpg`
    }
    try {
      const res = await fetch(img.src)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = guessName()
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: open in a new tab so the user can save manually.
      const a = document.createElement('a')
      a.href = img.src
      a.download = guessName()
      a.target = '_blank'
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  }, [])

  return (
    <>
      <PageHeader
        eyebrow={t('gallery.eyebrow')}
        title={t('gallery.title')}
        subtitle={t('gallery.subtitle')}
        image={featuredImages.hero}
      />

      <section className="section">
        <div className="container-page">
          {isAdmin && (
            <div className="mb-10 rounded-3xl border-2 border-dashed border-forest-300 bg-forest-50/60 p-6 dark:border-forest-600 dark:bg-forest-900/50 sm:p-8">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-forest-900 dark:text-forest-50">
                    <Upload className="h-5 w-5 text-forest-600 dark:text-gold-400" /> {t('gallery.admin.title')}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{t('gallery.admin.sub')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="btn-primary whitespace-nowrap disabled:opacity-60"
                >
                  {busy ? t('common.uploading') : t('common.choosePhotos')} <Upload className="h-4 w-4" />
                </button>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  handleFiles(e.dataTransfer.files)
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-5 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragging
                    ? 'border-forest-500 bg-forest-100 dark:bg-forest-800'
                    : 'border-earth-200 bg-white hover:border-forest-400 dark:border-forest-700 dark:bg-forest-950 dark:hover:border-forest-500'
                }`}
              >
                <p className="text-sm font-medium text-forest-700 dark:text-forest-200">{t('gallery.admin.drop')}</p>
                <p className="mt-1 text-xs text-earth-500 dark:text-forest-400">{t('gallery.admin.hint')}</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files)
                  e.target.value = ''
                }}
              />

              {error && <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
              {uploads.length > 0 && (
                <p className="mt-3 text-sm text-muted">
                  {uploads.length} {t('gallery.admin.saved')}
                </p>
              )}
            </div>
          )}

          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  filter === f.id
                    ? 'bg-forest-600 text-white shadow-sm dark:bg-forest-500'
                    : 'bg-earth-100 text-forest-700 hover:bg-earth-200 dark:bg-forest-900 dark:text-forest-100 dark:hover:bg-forest-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visibleImages.map((img, i) => (
              <div key={img.id || img.src} className="group relative">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className="block aspect-square w-full overflow-hidden rounded-2xl border border-earth-100 bg-earth-100 shadow-sm ring-forest-500 transition-shadow duration-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 dark:border-forest-800 dark:bg-forest-900"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-forest-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
                {img.uploaded && (
                  <span className="absolute left-2 top-2 rounded-full bg-forest-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {t('common.new')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => downloadImage(img)}
                  className={`absolute bottom-2 right-2 ${galleryDownloadBtn}`}
                  aria-label={t('gallery.download')}
                  title={t('gallery.download')}
                >
                  <Download className="h-4 w-4" />
                </button>
                {isAdmin && img.uploaded && (
                  <button
                    type="button"
                    onClick={() => removeUpload(img.id)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-red-600 opacity-0 shadow transition-opacity hover:bg-white group-hover:opacity-100 dark:bg-forest-900/90"
                    aria-label={t('common.deletePhoto')}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {(hasMore || canCollapse) && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-sm text-muted">
                {Math.min(visibleCount, images.length)} / {images.length}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => Math.min(c + STEP, images.length))}
                    className="btn-primary"
                  >
                    {t('common.viewMore')} <ArrowRight className="h-4 w-4 rotate-90" />
                  </button>
                )}
                {canCollapse && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(INITIAL_COUNT)}
                    className="btn-outline"
                  >
                    {t('common.showLess')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {isOpen && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-forest-900/95 p-4" role="dialog" aria-modal="true" onClick={close}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); downloadImage(images[index]) }}
            className={`absolute right-16 top-4 ${galleryDownloadBtn}`}
            aria-label={t('gallery.download')}
            title={t('gallery.download')}
          >
            <Download className="h-6 w-6" />
          </button>
          <button type="button" onClick={close} className={`absolute right-4 top-4 ${galleryCloseBtn}`} aria-label={t('auth.close')}>
            <Close className="h-6 w-6" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-6" aria-label="Previous">
            <ArrowRight className="h-6 w-6 rotate-180" />
          </button>
          <figure className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={images[index].src} alt={images[index].alt} className="max-h-[80vh] w-auto rounded-xl object-contain" />
            <figcaption className="mt-3 text-center text-sm text-forest-100/70">{index + 1} / {images.length}</figcaption>
          </figure>
          <button type="button" onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6" aria-label="Next">
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  )
}
