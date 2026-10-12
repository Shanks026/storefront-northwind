import { useEffect } from "react"

/**
 * Sets `data-scrolling` on <html> while the page scrolls (cleared 150ms after it stops).
 * index.css uses it to switch off pointer events in the page content, so cards passing under
 * the cursor don't start hover zooms / shadows mid-scroll. Mount once.
 */
export function useScrollHoverPause() {
  useEffect(() => {
    const root = document.documentElement
    let timer
    function onScroll() {
      if (!timer) root.dataset.scrolling = ""
      clearTimeout(timer)
      timer = setTimeout(() => {
        delete root.dataset.scrolling
        timer = undefined
      }, 150)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      clearTimeout(timer)
      delete root.dataset.scrolling
    }
  }, [])
}
