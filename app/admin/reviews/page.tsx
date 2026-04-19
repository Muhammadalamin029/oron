"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { reviewsApi } from "@/services/reviews"
import type { Review } from "@/types/api"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const load = async () => {
    const data = await reviewsApi.getAllReviews()
    setReviews(data)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        await load()
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load reviews")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const hay = `${r.title} ${r.comment} ${r.user?.email || ""} ${r.user?.full_name || ""} ${r.product_id}`.toLowerCase()
      return hay.includes(search.toLowerCase())
    })
  }, [reviews, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>
        <p className="text-muted-foreground">Approve or reject product reviews</p>
      </div>

      <Card>
        <CardHeader>
          <div className="max-w-md">
            <Input
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-md bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{r.user?.full_name || "—"}</p>
                          <p className="text-sm text-muted-foreground">{r.user?.email || r.user_id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.product_id}
                      </TableCell>
                      <TableCell>{r.rating}</TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="font-medium line-clamp-1">{r.title || "Review"}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{r.comment}</p>
                      </TableCell>
                      <TableCell>{r.is_approved ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={r.is_approved ? "outline" : "default"}
                          className={r.is_approved ? "" : "bg-primary text-primary-foreground"}
                          onClick={async () => {
                            try {
                              await reviewsApi.setApproval(r.id, !r.is_approved)
                              toast.success("Updated")
                              await load()
                            } catch (error: any) {
                              toast.error(error?.message || "Failed to update")
                            }
                          }}
                        >
                          {r.is_approved ? "Unapprove" : "Approve"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

