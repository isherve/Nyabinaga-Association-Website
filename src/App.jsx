import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import WhatsAppButton from './components/WhatsAppButton'
import Home from './pages/Home'

// Route-level code splitting keeps the initial bundle small; heavier pages
// (e.g. Impact with Recharts) are only loaded when visited.
const About = lazy(() => import('./pages/About'))
const Team = lazy(() => import('./pages/Team'))
const Groups = lazy(() => import('./pages/Groups'))
const Youth = lazy(() => import('./pages/Youth'))
const Children = lazy(() => import('./pages/Children'))
const Impact = lazy(() => import('./pages/Impact'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Contact = lazy(() => import('./pages/Contact'))
const Donate = lazy(() => import('./pages/Donate'))
const SmsAdmin = lazy(() => import('./pages/SmsAdmin'))
const ReportsAdmin = lazy(() => import('./pages/ReportsAdmin'))
const DailyReportAdmin = lazy(() => import('./pages/DailyReportAdmin'))
const MeetingsAdmin = lazy(() => import('./pages/MeetingsAdmin'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-forest-200 border-t-forest-600 dark:border-forest-800 dark:border-t-gold-400" />
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-earth-50 dark:bg-forest-950">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/youth" element={<Youth />} />
            <Route path="/children" element={<Children />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/admin/sms" element={<SmsAdmin />} />
            <Route path="/admin/reports" element={<ReportsAdmin />} />
            <Route path="/admin/daily" element={<DailyReportAdmin />} />
            <Route path="/admin/meetings" element={<MeetingsAdmin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
