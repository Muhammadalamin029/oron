"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { addressesApi } from "@/services/addresses"
import { useAuth } from "@/contexts/auth-context"
import type { Address } from "@/types/api"
import { getErrorMessage } from "@/lib/get-error-message"
import { SiteCard, SiteInput, SiteFieldLabel, PrimaryButton, SecondaryButton, SkeletonLine, Pill } from "@/components/site-ui"

export function AddressesSection() {
  const { isAuthenticated } = useAuth()
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
      } catch (error: unknown) {
        if (!cancelled) toast.error(getErrorMessage(error, "Failed to load addresses"))
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
    <SiteCard className="p-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-white">Shipping Addresses</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your saved shipping addresses for quick checkout
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Add New Address</h3>
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
                } catch (error: unknown) {
                  toast.error(getErrorMessage(error, "Failed to save"))
                } finally {
                  setCreating(false)
                }
              }}
            >
              <div className="space-y-2">
                <SiteFieldLabel htmlFor="label">Label</SiteFieldLabel>
                <SiteInput
                  id="label"
                  value={form.label}
                  onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <SiteFieldLabel htmlFor="phone">Phone</SiteFieldLabel>
                <SiteInput
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <SiteFieldLabel htmlFor="line1">Address Line 1</SiteFieldLabel>
                <SiteInput
                  id="line1"
                  value={form.line1}
                  onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <SiteFieldLabel htmlFor="line2">Address Line 2</SiteFieldLabel>
                <SiteInput
                  id="line2"
                  value={form.line2}
                  onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <SiteFieldLabel htmlFor="city">City</SiteFieldLabel>
                  <SiteInput
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <SiteFieldLabel htmlFor="state">State</SiteFieldLabel>
                  <SiteInput
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <SiteFieldLabel htmlFor="country">Country</SiteFieldLabel>
                  <SiteInput
                    id="country"
                    value={form.country}
                    onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <SiteFieldLabel htmlFor="postal">Postal Code</SiteFieldLabel>
                  <SiteInput
                    id="postal"
                    value={form.postal_code}
                    onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-foreground">Default</p>
                  <p className="text-xs text-muted-foreground">
                    Use as default shipping address
                  </p>
                </div>
                <Switch
                  checked={form.is_default}
                  onCheckedChange={(checked) => setForm((p) => ({ ...p, is_default: checked }))}
                />
              </div>
              <PrimaryButton
                type="submit"
                className="w-full"
                disabled={creating}
              >
                {creating ? "SAVING..." : "SAVE ADDRESS"}
              </PrimaryButton>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Saved Addresses</h3>
            {fetching ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonLine key={i} className="h-20" />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground border border-border rounded-lg">
                No saved addresses yet.
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-foreground">
                            {a.label || "Address"}
                          </p>
                          {a.is_default && <Pill active>Default</Pill>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}
                          {a.city && `, ${a.city}`}
                          {a.state && `, ${a.state}`}
                          {a.postal_code && ` ${a.postal_code}`}
                        </p>
                        {a.phone && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Phone: {a.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!a.is_default && (
                          <SecondaryButton
                            className="px-4 py-2 text-xs"
                            onClick={async () => {
                              try {
                                await addressesApi.update(a.id, { is_default: true })
                                toast.success("Set as default")
                                await load()
                              } catch (error: unknown) {
                                toast.error(getErrorMessage(error, "Failed to update"))
                              }
                            }}
                          >
                            Set Default
                          </SecondaryButton>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={async () => {
                            try {
                              await addressesApi.delete(a.id)
                              toast.success("Address deleted")
                              await load()
                            } catch (error: unknown) {
                              toast.error(getErrorMessage(error, "Failed to delete"))
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteCard>
  )
}
