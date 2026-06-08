import { useRef, useState } from 'react'
import { GraduationCap, Briefcase, Heart, Coffee, Camera, Loader2 } from 'lucide-react'
import { about } from '../data/about'
import { avatarUrl, uploadAvatar } from '../lib/avatar'

function Pill({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-sm text-cyan-100">
      {children}
    </span>
  )
}

function AvatarFallback({ name }) {
  return (
    <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
      {name.slice(0, 1)}
    </div>
  )
}

export default function About({ authed }) {
  const [version, setVersion] = useState(() => Date.now())
  const [imgFailed, setImgFailed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const pickFile = () => fileRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('please choose an image file')
      return
    }
    setError('')
    setUploading(true)
    try {
      await uploadAvatar(file)
      setImgFailed(false)
      setVersion(Date.now())
    } catch (err) {
      setError(err?.response?.data?.error || 'upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section id="about" className="scroll-mt-24">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white tracking-tight">About me</h2>
        <p className="text-slate-300 mt-2">A quick intro before you say hi.</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl shadow-blue-950/40">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-lg shadow-blue-500/40">
                {imgFailed ? (
                  <AvatarFallback name={about.name} />
                ) : (
                  <img
                    src={avatarUrl(version)}
                    alt={about.name}
                    onError={() => setImgFailed(true)}
                    className="w-full h-full rounded-full object-cover bg-slate-800"
                  />
                )}
              </div>
              {authed && (
                <>
                  <button
                    type="button"
                    onClick={pickFile}
                    disabled={uploading}
                    aria-label="Change avatar"
                    className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-wait"
                  >
                    {uploading ? (
                      <Loader2 className="w-7 h-7 text-white animate-spin" />
                    ) : (
                      <Camera className="w-7 h-7 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </>
              )}
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-white">{about.name}</h3>
            {error && (
              <p className="text-red-300 text-xs mt-2" role="alert">{error}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
            <p className="text-slate-200 leading-relaxed">{about.bio}</p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-cyan-300 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">College</p>
                  <p className="text-white">{about.college}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-cyan-300 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Job</p>
                  <p className="text-white">{about.job}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-purple-300" />
              <h4 className="text-white font-semibold">Interests</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {about.interests.map((i) => (
                <Pill key={i}>{i}</Pill>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Coffee className="w-4 h-4 text-cyan-300" />
              <h4 className="text-white font-semibold">Habits</h4>
            </div>
            <ul className="space-y-2">
              {about.habits.map((h) => (
                <li key={h} className="text-slate-200 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
