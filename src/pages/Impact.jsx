import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import AnimatedNumber from '../components/AnimatedNumber'
import { impactHighlights } from '../content/stats'
import { groups, formatRWF } from '../content/groups'
import { tp } from '../content/groupTranslations'
import { featuredImages } from '../content/site'
import { useSettings } from '../context/SettingsContext'

const barColors = ['#376f30', '#498b3f', '#69a95f', '#d9911f', '#c06e18']

const highlightKeys = [
  { label: 'impact.h1.label', from: 'impact.h1.from' },
  { label: 'impact.h2.label', from: 'impact.h2.from' },
  { label: 'impact.h3.label', from: 'impact.h3.from', compact: true },
  { label: 'impact.h4.label', from: 'impact.h4.from' },
]

const metricKeys = [
  'impact.m1',
  'impact.m2',
  'impact.m3',
  'impact.m4',
  'impact.m5',
  'impact.m6',
  'impact.m7',
  'impact.m8',
  'impact.m9',
  'impact.m10',
  'impact.m11',
  'impact.m12',
  'impact.m13',
  'impact.m14',
]

// Values are built per-language inside the component (currency + dates).
function buildMetricValues(lang) {
  return [
    '264',
    '210',
    '13',
    '12',
    formatRWF(72826010, lang),
    formatRWF(2205000, lang),
    formatRWF(70624480, lang),
    tp('November 1, 2011', lang),
    tp('November 19, 2011', lang),
    '18',
    '8',
    '5',
    '4',
    '4',
  ]
}

function CustomTooltip({ active, payload, lang }) {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-earth-100 bg-white px-4 py-2 shadow-lg dark:border-forest-700 dark:bg-forest-900">
        <p className="text-sm font-semibold text-forest-900 dark:text-forest-50">{payload[0].payload.name}</p>
        <p className="text-sm text-gold-600 dark:text-gold-400">{formatRWF(payload[0].value, lang)}</p>
      </div>
    )
  }
  return null
}

export default function Impact() {
  const { t, lang } = useSettings()
  const metricValues = buildMetricValues(lang)

  const chartData = groups
    .filter((g) => g.totalAssets > 0)
    .map((g) => ({ name: g.name, assets: g.totalAssets }))
    .sort((a, b) => b.assets - a.assets)

  return (
    <>
      <PageHeader
        eyebrow={t('impact.eyebrow')}
        title={t('impact.title')}
        subtitle={t('impact.subtitle')}
        image={featuredImages.impact}
      />

      <section className="section">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {impactHighlights.map((h, i) => (
              <Reveal key={h.label} delay={i * 90} className="card p-7 text-center">
                <div className="font-display text-4xl font-extrabold text-forest-700 dark:text-gold-400 sm:text-5xl">
                  <AnimatedNumber value={h.value} compact={highlightKeys[i].compact} />
                </div>
                <div className="mt-3 font-semibold text-forest-900 dark:text-forest-50">{t(highlightKeys[i].label)}</div>
                <div className="mt-1 text-sm text-muted">{t(highlightKeys[i].from)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section surface-muted">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t('impact.chart.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">{t('impact.chart.title')}</h2>
            <p className="mt-4 text-muted">{t('impact.chart.sub')}</p>
          </Reveal>
          <Reveal className="card mt-10 p-4 sm:p-8">
            <div className="h-[520px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 32, left: 8, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke="#eadfce" className="dark:opacity-30" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fill: '#6d402d', fontSize: 12 }} stroke="#d3b287" />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#264623', fontSize: 12 }} stroke="#d3b287" />
                  <Tooltip content={<CustomTooltip lang={lang} />} cursor={{ fill: '#f2e9db' }} />
                  <Bar dataKey="assets" radius={[0, 8, 8, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t('impact.table.eyebrow')}</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-900 dark:text-forest-50">{t('impact.table.title')}</h2>
          </Reveal>
          <Reveal className="card mx-auto mt-10 max-w-3xl overflow-hidden">
            <dl className="divide-y divide-earth-100 dark:divide-forest-800">
              {metricKeys.map((key, i) => (
                <div key={key} className="flex items-center justify-between gap-6 px-6 py-4 odd:bg-earth-50/50 dark:odd:bg-forest-900/50">
                  <dt className="text-sm text-muted sm:text-base">{t(key)}</dt>
                  <dd className="whitespace-nowrap font-display text-base font-bold text-forest-800 dark:text-gold-300 sm:text-lg">
                    {metricValues[i]}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>
    </>
  )
}
