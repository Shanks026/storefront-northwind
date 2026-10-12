import { useState } from "react"
import { Link, useLocation } from "react-router"
import { ChevronDown, Clock, MessageCircleQuestion, MessageSquareText, Send, ThumbsUp } from "lucide-react"
import { toast } from "sonner"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/hooks/use-auth"
import { useAskQuestion, useMyQuestions, useProductQuestions } from "@/hooks/use-products"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const INITIAL = 3
const MAX_LENGTH = 300

/** Customer Q&A: a card with the user's own questions and the answered (static) ones, then a separate "ask" accordion. */
export function ProductQuestions({ slug, vendor }) {
  const { data: questions, isPending } = useProductQuestions(slug)
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? questions : questions?.slice(0, INITIAL)

  return (
    <div className="space-y-3">
      {/* heading lives here so the section-level "See all" can sit beside it */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="questions-title" className="text-lg font-semibold tracking-tight">
          Questions &amp; answers
        </h2>
        {questions?.length > INITIAL && (
          <Button variant="link" size="sm" className="h-auto gap-1 px-0" onClick={() => setShowAll((s) => !s)}>
            {showAll ? "Show fewer" : `See all ${questions.length} questions`}
            <ChevronDown className={cn("transition-transform", showAll && "rotate-180")} />
          </Button>
        )}
      </div>

      {isPending ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <MyQuestions slug={slug} vendor={vendor} />
  
          <Accordion type="multiple" defaultValue={[questions[0]?.id]} className="px-5 [&>*:last-child]:border-b-0">
            {visible.map((q) => (
              <AccordionItem key={q.id} value={q.id}>
                <AccordionTrigger className="gap-3 py-4 hover:no-underline">
                  <span className="flex items-start gap-2.5 text-left">
                    <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-sm font-medium">{q.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-6.5">
                  <p className="text-sm leading-relaxed text-foreground/85">{q.answer}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <Badge
                      className={
                        q.role === "Seller"
                          ? "border-transparent bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
                          : "border-transparent bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300"
                      }
                    >
                      {q.role}
                    </Badge>
                    <span>
                      {q.answeredBy} · {formatDate(q.answeredAt)}
                    </span>
                    {q.helpful > 0 && (
                      <span className="inline-flex items-center gap-1">
                        · <ThumbsUp className="size-3" /> {q.helpful}
                      </span>
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      <AskQuestion slug={slug} vendor={vendor} />
    </div>
  )
}

/** Collapsible "ask the seller" card with a textarea. Questions are only recorded; the vendor portal answers them. */
function AskQuestion({ slug, vendor }) {
  const { isAuthenticated } = useSession()
  const location = useLocation()
  const ask = useAskQuestion(slug)
  const [text, setText] = useState("")

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    ask.mutate(text, {
      onSuccess: () => {
        setText("")
        toast.success("Question submitted", { description: `${vendor} will answer it soon.` })
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
      <AccordionItem value="ask" className="border-b-0">
        <AccordionTrigger className="items-center gap-3 py-4 hover:no-underline">
          <span className="flex items-center gap-3 text-left">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
              <MessageSquareText className="size-4.5" />
            </span>
            <span>
              <span className="block text-sm font-medium">Can&apos;t find your answer?</span>
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                Ask {vendor} directly. You&apos;ll see the answer here once they reply.
              </span>
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="pl-12">
          {isAuthenticated ? (
            <form onSubmit={submit}>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Is this suitable for daily use?"
                aria-label="Your question"
                maxLength={MAX_LENGTH}
                className="min-h-24 resize-none"
              />
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {text.length}/{MAX_LENGTH}
                </span>
                <Button type="submit" size="sm" disabled={!text.trim() || ask.isPending}>
                  <Send /> {ask.isPending ? "Sending…" : "Ask question"}
                </Button>
              </div>
            </form>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to={`/login?redirect=${encodeURIComponent(location.pathname + "#questions")}`}>Sign in to ask a question</Link>
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function MyQuestions({ slug, vendor }) {
  const { data: mine } = useMyQuestions(slug)
  if (!mine?.length) return null

  return (
    <ul className="divide-y border-b px-5" aria-label="Your questions">
      {mine.map((q) => (
        <li key={q.id} className="flex items-start gap-2.5 py-4">
          <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium break-words">{q.question}</p>
            {q.status === "answered" ? (
              <p className="mt-1.5 text-sm text-foreground/85">{q.answer}</p>
            ) : (
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <Badge className="border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  <Clock /> Awaiting answer
                </Badge>
                <span>
                  You asked on {formatDate(q.askedAt)} · {vendor} usually replies within 2 days
                </span>
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
