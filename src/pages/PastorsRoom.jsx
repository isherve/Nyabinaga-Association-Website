import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import PasswordModal from '../components/PasswordModal'
import Reveal from '../components/Reveal'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { featuredImages } from '../content/site'
import { Megaphone, Pin, Lock, Unlock, Check, Close, Trash } from '../components/Icons'
import {
  getAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  removeAnnouncement,
} from '../lib/announcementsStore'

const emptyForm = () => ({
  title: '',
  body: '',
  author: '',
  date: new Date().toISOString().slice(0, 10),
  pinned: false,
})

const fmtDate = (d) => {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return d
  }
}

const inputCls =
  'w-full rounded-xl border border-earth-200 bg-earth-50 px-3 py-2 text-forest-900 focus:border-forest-500 focus:outline-none dark:border-forest-700 dark:bg-forest-950 dark:text-forest-50'

export default function PastorsRoom() {
  const { isAdmin } = useAuth()
  const { t } = useSettings()
  const [loginOpen, setLoginOpen] = useState(false)
  const [posts, setPosts] = useState(() => getAnnouncements())
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const openNew = () => {
    setForm(emptyForm())
    setEditingId(null)
    setFormOpen(true)
  }

  const openEdit = (p) => {
    setForm({ title: p.title, body: p.body, author: p.author, date: p.date, pinned: p.pinned })
    setEditingId(p.id)
    setFormOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() && !form.body.trim()) return
    setPosts(editingId ? updateAnnouncement(editingId, form) : addAnnouncement(form))
    setFormOpen(false)
    setForm(emptyForm())
    setEditingId(null)
  }

  const handleRemove = (id) => {
    if (confirm(t('pastors.confirmDelete'))) setPosts(removeAnnouncement(id))
  }

  return (
    <>
      <PageHeader
        eyebrow={t('pastors.eyebrow')}
        title={t('pastors.title')}
        subtitle={t('pastors.subtitle')}
        image={featuredImages.about}
      />

      <section className="section">
        <div className="container-page">
          {/* Publisher toolbar */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-3xl border border-earth-100 bg-earth-50/60 p-6 dark:border-forest-800 dark:bg-forest-900/50 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest-100 text-forest-600 dark:bg-forest-800 dark:text-gold-400">
                <Megaphone className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-forest-900 dark:text-forest-50">{t('pastors.boardTitle')}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  {isAdmin ? t('pastors.canPublish') : t('pastors.readOnly')}
                </p>
              </div>
            </div>
            {isAdmin ? (
              <button type="button" onClick={openNew} className="btn-primary shrink-0 text-sm">
                <Megaphone className="h-4 w-4" /> {t('pastors.newPost')}
              </button>
            ) : (
              <button type="button" onClick={() => setLoginOpen(true)} className="btn-outline shrink-0 text-sm">
                <Unlock className="h-4 w-4" /> {t('pastors.signInToPublish')}
              </button>
            )}
          </div>

          {/* Announcements */}
          {posts.length === 0 ? (
            <div className="card py-16 text-center">
              <Megaphone className="mx-auto h-10 w-10 text-earth-400 dark:text-forest-600" />
              <p className="mt-3 text-muted">{t('pastors.empty')}</p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-5">
              {posts.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 60}>
                  <article className={`card p-6 ${p.pinned ? 'ring-2 ring-gold-400/50' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        {p.pinned && (
                          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-earth-700 dark:bg-gold-900/30 dark:text-gold-300">
                            <Pin className="h-3.5 w-3.5" /> {t('pastors.pinned')}
                          </span>
                        )}
                        <h3 className="font-display text-xl font-bold text-forest-900 dark:text-forest-50">{p.title || '—'}</h3>
                        <p className="mt-1 text-sm text-muted">
                          {p.author ? `${p.author} · ` : ''}{fmtDate(p.date)}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex shrink-0 items-center gap-3">
                          <button type="button" onClick={() => openEdit(p)} className="text-sm font-medium text-forest-600 hover:underline dark:text-gold-300">
                            {t('pastors.edit')}
                          </button>
                          {!p.seed && (
                            <button type="button" onClick={() => handleRemove(p.id)} className="text-earth-400 transition-colors hover:text-red-600" aria-label={t('common.remove')}>
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {p.body && (
                      <p className="mt-4 whitespace-pre-line leading-relaxed text-forest-800 dark:text-forest-100">{p.body}</p>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Publish / edit modal */}
      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm" aria-label={t('auth.close')} onClick={() => setFormOpen(false)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-forest-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-forest-900 dark:text-forest-50">
                {editingId ? t('pastors.editPost') : t('pastors.newPost')}
              </h3>
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg p-1.5 text-earth-500 hover:bg-earth-100 dark:text-forest-300 dark:hover:bg-forest-800" aria-label={t('auth.close')}>
                <Close className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-forest-800 dark:text-forest-100">{t('pastors.fieldTitle')}</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} className={`mt-1 ${inputCls}`} placeholder={t('pastors.fieldTitle')} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-forest-800 dark:text-forest-100">{t('pastors.fieldBody')}</label>
                <textarea rows={5} value={form.body} onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))} className={`mt-1 resize-y ${inputCls}`} placeholder={t('pastors.fieldBody')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-forest-800 dark:text-forest-100">{t('pastors.fieldAuthor')}</label>
                  <input type="text" value={form.author} onChange={(e) => setForm((s) => ({ ...s, author: e.target.value }))} className={`mt-1 ${inputCls}`} placeholder={t('pastors.fieldAuthor')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-forest-800 dark:text-forest-100">{t('pastors.fieldDate')}</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} className={`mt-1 ${inputCls}`} />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-forest-800 dark:text-forest-100">
                <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((s) => ({ ...s, pinned: e.target.checked }))} className="h-4 w-4 accent-forest-600" />
                <Pin className="h-4 w-4 text-gold-500" /> {t('pastors.pinLabel')}
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setFormOpen(false)} className="btn-outline">{t('pastors.cancel')}</button>
                <button type="submit" className="btn-primary">
                  <Check className="h-4 w-4" /> {editingId ? t('pastors.saveChanges') : t('pastors.publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PasswordModal open={loginOpen} mode="admin" onClose={() => setLoginOpen(false)} />
    </>
  )
}
