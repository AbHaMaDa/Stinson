import About from '../components/About'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function AboutPage() {
  useDocumentTitle('About')
  return (
    <div className="max-w-4xl mx-auto px-4 pt-12">
      <About />
    </div>
  )
}
