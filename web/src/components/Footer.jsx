import { Github, Linkedin, Mail, MapPin } from 'lucide-react'
import { about } from '../data/about'

function XIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-slate-950/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-white font-semibold text-lg">{about.name}</h3>
          <p className="text-slate-300 text-sm mt-2 max-w-xs">
            Thanks for stopping by. Drop me a message any time.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-300" />
              <a
                href={`mailto:${about.contact.email}`}
                className="hover:text-white transition-colors duration-200"
              >
                {about.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-300" />
              <span>{about.contact.location}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Find me online</h4>
          <div className="flex items-center gap-3">
            <a
              href={about.contact.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="p-2.5 rounded-lg bg-white/5 hover:bg-cyan-400/15 border border-white/10 hover:border-cyan-400/30 transition-colors duration-200 cursor-pointer"
            >
              <Github className="w-5 h-5 text-slate-300" />
            </a>
            <a
              href={about.contact.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="p-2.5 rounded-lg bg-white/5 hover:bg-cyan-400/15 border border-white/10 hover:border-cyan-400/30 transition-colors duration-200 cursor-pointer"
            >
              <Linkedin className="w-5 h-5 text-slate-300" />
            </a>
            <a
              href={about.contact.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="p-2.5 rounded-lg bg-white/5 hover:bg-cyan-400/15 border border-white/10 hover:border-cyan-400/30 transition-colors duration-200 cursor-pointer"
            >
              <InstagramIcon className="w-5 h-5 text-slate-300" />
            </a>
            <a
              href={about.contact.X}
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="p-2.5 rounded-lg bg-white/5 hover:bg-cyan-400/15 border border-white/10 hover:border-cyan-400/30 transition-colors duration-200 cursor-pointer"
            >
              <XIcon className="w-5 h-5 text-slate-300" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} {about.name}. Built with React + Express + MongoDB.
      </div>
    </footer>
  )
}
