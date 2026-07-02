// Reusable page header banner with a background photo and overlay.
export default function PageHeader({ eyebrow, title, subtitle, image }) {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900/90 via-forest-800/80 to-forest-700/70" />
      </div>
      <div className="container-page relative py-20 sm:py-24 lg:py-28">
        {eyebrow && (
          <span className="inline-block rounded-full bg-gold-400/20 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-gold-200">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-forest-50/90">{subtitle}</p>
        )}
      </div>
    </header>
  )
}
