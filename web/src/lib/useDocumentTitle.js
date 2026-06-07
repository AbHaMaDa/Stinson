import { useEffect } from 'react'

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · Stinson` : 'Stinson'
    return () => {
      document.title = previous
    }
  }, [title])
}
