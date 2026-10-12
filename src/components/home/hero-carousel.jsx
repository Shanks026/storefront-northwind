import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import Autoplay from "embla-carousel-autoplay"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { categoryHref, DEALS_HREF } from "@/lib/categories"
import { cn } from "@/lib/utils"

// Placeholder campaign banners — swap for CMS data later. Photos: Unsplash (see CREDITS.md).
// `bg` is the gradient shown behind the photo while it loads (or if it fails).
const BANNERS = [
  {
    id: "fall-sale",
    eyebrow: "Fall Mega Sale · Ends Sunday",
    title: "Up to 40% off desk & tech",
    body: "Keyboards, lamps, stands and audio from top-rated makers.",
    cta: "Shop the sale",
    to: DEALS_HREF,
    image: "/images/banners/sale.webp",
    bg: "from-orange-600 via-orange-500 to-amber-400",
  },
  {
    id: "audio",
    eyebrow: "New arrivals",
    title: "Hear every detail",
    body: "Studio-grade headphones and speakers, now in stock.",
    cta: "Explore audio",
    to: categoryHref("electronics", "headphones"),
    image: "/images/banners/audio.webp",
    bg: "from-slate-900 via-slate-800 to-indigo-700",
  },
  {
    id: "workspace",
    eyebrow: "Back to work",
    title: "Workspace upgrades from ₹999",
    body: "Everything you need for a desk you actually want to sit at.",
    cta: "Upgrade your desk",
    to: categoryHref("computers"),
    image: "/images/banners/workspace.webp",
    bg: "from-emerald-700 via-emerald-600 to-teal-500",
  },
  {
    id: "gifts",
    eyebrow: "Gift guide",
    title: "Gifts they'll actually use",
    body: "Curated sets, gift cards and picks under ₹1,000.",
    cta: "Find a gift",
    to: categoryHref("gifts"),
    image: "/images/banners/gifts.webp",
    bg: "from-fuchsia-700 via-pink-600 to-rose-500",
  },
]

export function HeroCarousel() {
  const [api, setApi] = useState()
  const [selected, setSelected] = useState(0)
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }))

  useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    return () => api.off("select", onSelect)
  }, [api])

  return (
    <section aria-roledescription="carousel" aria-label="Featured promotions" className="group/hero relative">
      <Carousel setApi={setApi} opts={{ loop: true }} plugins={[autoplay.current]} className="overflow-hidden rounded-2xl">
        <CarouselContent className="ml-0">
          {BANNERS.map((b, i) => (
            <CarouselItem
              key={b.id}
              className="pl-0"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${BANNERS.length}`}
            >
              <Banner banner={b} eager={i === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 hidden border-white/30 bg-black/25 text-white hover:bg-black/40 hover:text-white sm:flex lg:opacity-0 lg:group-hover/hero:opacity-100" />
        <CarouselNext className="right-3 hidden border-white/30 bg-black/25 text-white hover:bg-black/40 hover:text-white sm:flex lg:opacity-0 lg:group-hover/hero:opacity-100" />
      </Carousel>
      <div className="absolute bottom-4 left-6 flex gap-1.5 sm:left-10">
        {BANNERS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={selected === i}
            className={cn(
              "h-1.5 rounded-full bg-white/50 transition-all hover:bg-white/80",
              selected === i ? "w-6 bg-white" : "w-1.5",
            )}
          />
        ))}
      </div>
    </section>
  )
}

function Banner({ banner: b, eager }) {
  return (
    <div
      className={cn(
        "relative flex h-[240px] items-center overflow-hidden bg-gradient-to-br px-6 text-white sm:h-[300px] sm:px-10 lg:h-[340px]",
        b.bg,
      )}
    >
      <img
        src={b.image}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 size-full object-cover"
        aria-hidden
      />
      {/* keeps the copy readable on any photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/5" aria-hidden />

      <div className="relative max-w-md">
        <p className="text-xs font-semibold tracking-wide text-white/85 uppercase">{b.eyebrow}</p>
        <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">{b.title}</h2>
        <p className="mt-2 text-sm text-white/85 sm:text-base">{b.body}</p>
        <Button asChild size="lg" className="mt-5 shadow-md">
          <Link to={b.to}>
            {b.cta} <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  )
}
