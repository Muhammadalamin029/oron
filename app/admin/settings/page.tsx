"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { settingsApi } from "@/services/settings"

export default function AdminSettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "ORON",
    storeEmail: "contact@oron.com",
    storePhone: "+234 800 123 4567",
    currency: "NGN",
    enableNotifications: true,
    enableNewsletter: true,
    maintenanceMode: false,
    shippingFlatRate: "2500",
    freeShippingThreshold: "100000",
    enableExpressShipping: true,
  })

  const [loading, setLoading] = useState(true)
  const [savingTab, setSavingTab] = useState<string | null>(null)
  const [initialMap, setInitialMap] = useState<Record<string, string>>({})

  const keyMap = useMemo(
    () => ({
      storeName: "site_name",
      storeEmail: "contact_email",
      storePhone: "contact_phone",
      currency: "currency_symbol",
      enableNotifications: "enable_notifications",
      enableNewsletter: "enable_newsletter",
      maintenanceMode: "maintenance_mode",
      shippingFlatRate: "shipping_flat_rate",
      freeShippingThreshold: "shipping_free_threshold",
      enableExpressShipping: "enable_express_shipping",
    }),
    []
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const settings = await settingsApi.getAllSettings()
        if (cancelled) return

        const map: Record<string, string> = {}
        for (const s of settings) map[s.key] = s.value
        setInitialMap(map)

        setStoreSettings((prev) => ({
          ...prev,
          storeName: map.site_name ?? prev.storeName,
          storeEmail: map.contact_email ?? prev.storeEmail,
          storePhone: map.contact_phone ?? prev.storePhone,
          currency: map.currency_symbol ?? prev.currency,
          enableNotifications:
            (map.enable_notifications ?? String(prev.enableNotifications)) ===
            "true",
          enableNewsletter:
            (map.enable_newsletter ?? String(prev.enableNewsletter)) === "true",
          maintenanceMode:
            (map.maintenance_mode ?? String(prev.maintenanceMode)) === "true",
          shippingFlatRate: map.shipping_flat_rate ?? prev.shippingFlatRate,
          freeShippingThreshold:
            map.shipping_free_threshold ?? prev.freeShippingThreshold,
          enableExpressShipping:
            (map.enable_express_shipping ??
              String(prev.enableExpressShipping)) === "true",
        }))
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load settings")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [keyMap])

  const saveFields = async (tab: string, fields: (keyof typeof storeSettings)[]) => {
    try {
      setSavingTab(tab)
      const updates = fields
        .map((field) => {
          const key = (keyMap as any)[field] as string
          const rawValue = (storeSettings as any)[field]
          const value = typeof rawValue === "boolean" ? String(rawValue) : String(rawValue)
          if ((initialMap[key] ?? "") === value) return null
          return { key, value }
        })
        .filter(Boolean) as { key: string; value: string }[]

      await Promise.all(
        updates.map((u) => settingsApi.updateSetting(u.key, u.value))
      )

      const nextInitial = { ...initialMap }
      for (const u of updates) nextInitial[u.key] = u.value
      setInitialMap(nextInitial)

      toast.success("Settings saved successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to save settings")
    } finally {
      setSavingTab(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-md bg-muted/30 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        storeName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        storeEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Store Phone</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.storePhone}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        storePhone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={storeSettings.currency}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        currency: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              )}

              <div className="flex items-center justify-between py-4 border-t border-border">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable your store for maintenance
                  </p>
                </div>
                <Switch
                  checked={storeSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setStoreSettings({
                      ...storeSettings,
                      maintenanceMode: checked,
                    })
                  }
                />
              </div>

              <Button
                onClick={() =>
                  saveFields("general", [
                    "storeName",
                    "storeEmail",
                    "storePhone",
                    "currency",
                    "maintenanceMode",
                  ])
                }
                className="bg-primary text-primary-foreground"
                disabled={loading || savingTab === "general"}
              >
                {savingTab === "general" ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <p className="font-medium">Order Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for new orders
                  </p>
                </div>
                <Switch
                  checked={storeSettings.enableNotifications}
                  onCheckedChange={(checked) =>
                    setStoreSettings({
                      ...storeSettings,
                      enableNotifications: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <p className="font-medium">Newsletter Subscriptions</p>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to subscribe to your newsletter
                  </p>
                </div>
                <Switch
                  checked={storeSettings.enableNewsletter}
                  onCheckedChange={(checked) =>
                    setStoreSettings({
                      ...storeSettings,
                      enableNewsletter: checked,
                    })
                  }
                />
              </div>

              <Button
                onClick={() =>
                  saveFields("notifications", [
                    "enableNotifications",
                    "enableNewsletter",
                  ])
                }
                className="bg-primary text-primary-foreground"
                disabled={loading || savingTab === "notifications"}
              >
                {savingTab === "notifications" ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Flat Rate Shipping</Label>
                  <Input
                    value={storeSettings.shippingFlatRate}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        shippingFlatRate: e.target.value,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Standard shipping rate in NGN
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Free Shipping Threshold</Label>
                  <Input
                    value={storeSettings.freeShippingThreshold}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        freeShippingThreshold: e.target.value,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Free shipping for orders above this amount
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-border">
                <div>
                  <p className="font-medium">Enable Express Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    Offer express delivery option to customers
                  </p>
                </div>
                <Switch
                  checked={storeSettings.enableExpressShipping}
                  onCheckedChange={(checked) =>
                    setStoreSettings({
                      ...storeSettings,
                      enableExpressShipping: checked,
                    })
                  }
                />
              </div>

              <Button
                onClick={() =>
                  saveFields("shipping", [
                    "shippingFlatRate",
                    "freeShippingThreshold",
                    "enableExpressShipping",
                  ])
                }
                className="bg-primary text-primary-foreground"
                disabled={loading || savingTab === "shipping"}
              >
                {savingTab === "shipping" ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
