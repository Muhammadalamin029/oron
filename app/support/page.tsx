"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Textarea } from "@/components/ui/textarea"
import { supportApi } from "@/services/support"
import { useAuth } from "@/contexts/auth-context"
import type { SupportTicket } from "@/types/api"
import { getErrorMessage } from "@/lib/get-error-message"
import { SiteMain, PageHeading, SiteCard, SiteInput, SiteFieldLabel, PrimaryButton, SkeletonLine } from "@/components/site-ui"
import { cn } from "@/lib/utils"

export default function SupportPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<SupportTicket | null>(null)
  const [fetching, setFetching] = useState(true)
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState(false)
  const [createForm, setCreateForm] = useState({ subject: "", message: "" })
  const [reply, setReply] = useState("")

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/auth/login?next=${encodeURIComponent("/support")}`)
    }
  }, [loading, isAuthenticated, router])

  const load = async () => {
    const data = await supportApi.myTickets()
    setTickets(data)
    if (!selectedId && data[0]?.id) setSelectedId(data[0].id)
  }

  useEffect(() => {
    let cancelled = false
    if (!isAuthenticated) return
    ;(async () => {
      try {
        setFetching(true)
        await load()
      } catch (error: unknown) {
        if (!cancelled) toast.error(getErrorMessage(error, "Failed to load tickets"))
      } finally {
        if (!cancelled) setFetching(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    let cancelled = false
    if (!selectedId) {
      setSelected(null)
      return
    }
    ;(async () => {
      try {
        const ticket = await supportApi.getTicket(selectedId)
        if (!cancelled) setSelected(ticket)
      } catch (error: unknown) {
        if (!cancelled) toast.error(getErrorMessage(error, "Failed to load ticket"))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) =>
      (b.updated_at || b.created_at || "").localeCompare(a.updated_at || a.created_at || "")
    )
  }, [tickets])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SiteMain>
        <PageHeading sub="Create a ticket for disputes, refunds, or general help.">
          Support
        </PageHeading>

        <div className="grid lg:grid-cols-3 gap-6">
          <SiteCard className="p-6 lg:col-span-1">
            <h2 className="font-display font-bold text-lg text-foreground mb-4">New Ticket</h2>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                try {
                  setCreating(true)
                  const created = await supportApi.createTicket(createForm)
                  toast.success("Ticket created")
                  setCreateForm({ subject: "", message: "" })
                  await load()
                  setSelectedId(created.id)
                } catch (error: unknown) {
                  toast.error(getErrorMessage(error, "Failed to create ticket"))
                } finally {
                  setCreating(false)
                }
              }}
            >
              <div className="space-y-2">
                <SiteFieldLabel htmlFor="subject">Subject</SiteFieldLabel>
                <SiteInput
                  id="subject"
                  value={createForm.subject}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, subject: e.target.value }))
                  }
                  placeholder="e.g. Refund request"
                  required
                />
              </div>
              <div className="space-y-2">
                <SiteFieldLabel htmlFor="message">Message</SiteFieldLabel>
                <Textarea
                  id="message"
                  value={createForm.message}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, message: e.target.value }))
                  }
                  placeholder="Describe your issue"
                  required
                />
              </div>
              <PrimaryButton
                type="submit"
                className="w-full"
                disabled={creating}
              >
                {creating ? "CREATING..." : "CREATE TICKET"}
              </PrimaryButton>
            </form>

            <div className="mt-8">
              <p className="text-sm font-medium text-foreground mb-3">
                My Tickets
              </p>
              {fetching ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonLine key={i} className="h-10" />
                  ))}
                </div>
              ) : sortedTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tickets yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedTickets.map((t) => (
                    <button
                      key={t.id}
                      className={cn(
                        "w-full text-left rounded-lg border border-border p-3 hover:border-primary/30 transition-colors",
                        selectedId === t.id && "bg-muted/30"
                      )}
                      onClick={() => setSelectedId(t.id)}
                    >
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {t.subject}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.status} •{" "}
                        {t.created_at
                          ? new Date(t.created_at).toLocaleDateString("en-NG")
                          : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SiteCard>

          <SiteCard className="p-6 lg:col-span-2">
            <h2 className="font-display font-bold text-lg text-foreground mb-4">Conversation</h2>
            {!selected ? (
              <div className="py-12 text-center text-muted-foreground">
                Select a ticket to view messages.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="font-medium text-foreground">
                    {selected.subject}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Status: {selected.status}
                  </p>
                </div>

                <div className="space-y-3">
                  {(selected.messages || []).map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "rounded-lg border border-border p-4",
                        m.sender === "admin" && "bg-muted/20"
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-foreground">
                          {m.sender === "admin" ? "Support" : "You"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.created_at
                            ? new Date(m.created_at).toLocaleString("en-NG")
                            : ""}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                        {m.message}
                      </p>
                    </div>
                  ))}
                </div>

                <form
                  className="space-y-2"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!selectedId || !reply.trim()) return
                    try {
                      setSending(true)
                      await supportApi.addMessage(selectedId, reply.trim())
                      setReply("")
                      const fresh = await supportApi.getTicket(selectedId)
                      setSelected(fresh)
                      toast.success("Message sent")
                    } catch (error: unknown) {
                      toast.error(getErrorMessage(error, "Failed to send"))
                    } finally {
                      setSending(false)
                    }
                  }}
                >
                  <SiteFieldLabel htmlFor="reply">Reply</SiteFieldLabel>
                  <Textarea
                    id="reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply..."
                    disabled={sending}
                  />
                  <PrimaryButton
                    type="submit"
                    disabled={sending || !reply.trim()}
                  >
                    {sending ? "SENDING..." : "SEND"}
                  </PrimaryButton>
                </form>
              </div>
            )}
          </SiteCard>
        </div>
      </SiteMain>
      <Footer />
    </div>
  )
}
