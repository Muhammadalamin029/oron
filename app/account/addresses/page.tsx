"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { addressesApi } from "@/services/addresses"
import { useAuth } from "@/contexts/auth-context"
import type { Address } from "@/types/api"

export default function AddressesPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [fetching, setFetching] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    label: "Home",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "Nigeria",
    postal_code: "",
    is_default: true,
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/auth/login?next=${encodeURIComponent("/account/addresses")}`)
    }
  }, [loading, isAuthenticated, router])

  const load = async () => {
    const data = await addressesApi.list()
    setAddresses(data)
  }

  useEffect(() => {
    let cancelled = false
    if (!isAuthenticated) return
    ;(async () => {
      try {
        setFetching(true)
        await load()
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load addresses")
      } finally {
        if (!cancelled) setFetching(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif text-foreground">Addresses</h1>
          <p className="text-muted-foreground mt-1">
            Manage your saved shipping addresses.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add Address</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    setCreating(true)
                    await addressesApi.create(form)
                    toast.success("Address saved")
                    setForm((p) => ({ ...p, line1: "", line2: "" }))
                    await load()
                  } catch (error: any) {
                    toast.error(error?.message || "Failed to save")
                  } finally {
                    setCreating(false)
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={form.label}
                    onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line1">Address Line 1</Label>
                  <Input
                    id="line1"
                    value={form.line1}
                    onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line2">Address Line 2</Label>
                  <Input
                    id="line2"
                    value={form.line2}
                    onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={form.state}
                      onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal">Postal Code</Label>
                    <Input
                      id="postal"
                      value={form.postal_code}
                      onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Default</p>
                    <p className="text-xs text-muted-foreground">
                      Use as default shipping address
                    </p>
                  </div>
                  <Switch
                    checked={form.is_default}
                    onCheckedChange={(checked) => setForm((p) => ({ ...p, is_default: checked }))}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={creating}
                >
                  {creating ? "Saving..." : "Save Address"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {fetching ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-md bg-muted/30 animate-pulse" />
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No saved addresses.
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <div key={a.id} className="rounded-md border border-border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {a.label || "Address"} {a.is_default ? "(Default)" : ""}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {a.line1}
                            {a.line2 ? `, ${a.line2}` : ""} • {a.city} {a.state}
                          </p>
                          {a.phone && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {a.phone}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          className="text-destructive"
                          onClick={async () => {
                            try {
                              await addressesApi.delete(a.id)
                              toast.success("Deleted")
                              await load()
                            } catch (error: any) {
                              toast.error(error?.message || "Failed to delete")
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                      {!a.is_default && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await addressesApi.update(a.id, { is_default: true })
                                toast.success("Set as default")
                                await load()
                              } catch (error: any) {
                                toast.error(error?.message || "Failed to update")
                              }
                            }}
                          >
                            Set Default
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
