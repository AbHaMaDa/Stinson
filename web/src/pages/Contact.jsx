import ContactForm from '../components/ContactForm'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function ContactPage() {
  useDocumentTitle('Contact')
  return (
    <div className="max-w-4xl mx-auto px-4 pt-12">
      <ContactForm />
    </div>
  )
}
