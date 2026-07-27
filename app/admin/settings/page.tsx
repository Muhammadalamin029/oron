"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { settingsApi } from "@/services/settings"
import { AdminPageHeader, GlassCard, SkeletonRows, OrangeButton } from "@/components/admin-ui"
import { cn } from "@/lib/utils"

const TABS = ["general", "notifications", "shipping"] as const
type Tab = (typeof TABS)[number]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
        checked ? "bg-[#ff6b00]" : "bg-[#2a2a2a]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  )
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
      {children}
    </label>
  )
}

function DarkTextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
    />
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  bordered = true,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  bordered?: boolean
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-4", bordered && "border-t border-white/5")}>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-sm text-[#9a9898]">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general")
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
            (map.enable_notifications ?? String(prev.enableNotifications)) === "true",
          enableNewsletter:
            (map.enable_newsletter ?? String(prev.enableNewsletter)) === "true",
          maintenanceMode:
            (map.maintenance_mode ?? String(prev.maintenanceMode)) === "true",
          shippingFlatRate: map.shipping_flat_rate ?? prev.shippingFlatRate,
          freeShippingThreshold:
            map.shipping_free_threshold ?? prev.freeShippingThreshold,
          enableExpressShipping:
            (map.enable_express_shipping ?? String(prev.enableExpressShipping)) === "true",
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

      await Promise.all(updates.map((u) => settingsApi.updateSetting(u.key, { value: u.value })))

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

  const set = (field: keyof typeof storeSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setStoreSettings((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="space-y-6">
      <AdminPageHeader title="SETTINGS" sub="/ STORE PREFERENCES" />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all",
              activeTab === tab
                ? "bg-[#ff6b00] text-white"
                : "bg-[#0a0a0a] border border-[#1a1a1a] text-[#9a9898] hover:border-[#ff6b00] hover:text-[#ff6b00]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <GlassCard className="p-6">
          <h3 className="font-display font-bold text-lg text-white mb-6">Store Information</h3>
          {loading ? (
            <SkeletonRows count={4} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FormLabel>Store Name</FormLabel>
                  <DarkTextInput value={storeSettings.storeName} onChange={set("storeName")} />
                </div>
                <div>
                  <FormLabel>Store Email</FormLabel>
                  <DarkTextInput
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={set("storeEmail")}
                  />
                </div>
                <div>
                  <FormLabel>Store Phone</FormLabel>
                  <DarkTextInput value={storeSettings.storePhone} onChange={set("storePhone")} />
                </div>
                <div>
                  <FormLabel>Currency</FormLabel>
                  <DarkTextInput value={storeSettings.currency} onChange={set("currency")} />
                </div>
              </div>

              <ToggleRow
                title="Maintenance Mode"
                description="Temporarily disable your store for maintenance"
                checked={storeSettings.maintenanceMode}
                onChange={(v) => setStoreSettings((prev) => ({ ...prev, maintenanceMode: v }))}
              />

              <div className="pt-4">
                <OrangeButton
                  onClick={() =>
                    saveFields("general", ["storeName", "storeEmail", "storePhone", "currency", "maintenanceMode"])
                  }
                  disabled={loading || savingTab === "general"}
                >
                  {savingTab === "general" ? "SAVING..." : "SAVE CHANGES"}
                </OrangeButton>
              </div>
            </>
          )}
        </GlassCard>
      )}

      {activeTab === "notifications" && (
        <GlassCard className="p-6">
          <h3 className="font-display font-bold text-lg text-white mb-2">Notification Settings</h3>
          <div className="divide-y-0">
            <ToggleRow
              title="Order Notifications"
              description="Receive email notifications for new orders"
              checked={storeSettings.enableNotifications}
              onChange={(v) => setStoreSettings((prev) => ({ ...prev, enableNotifications: v }))}
            />
            <ToggleRow
              title="Newsletter Subscriptions"
              description="Allow customers to subscribe to your newsletter"
              checked={storeSettings.enableNewsletter}
              onChange={(v) => setStoreSettings((prev) => ({ ...prev, enableNewsletter: v }))}
            />
          </div>
          <div className="pt-4">
            <OrangeButton
              onClick={() => saveFields("notifications", ["enableNotifications", "enableNewsletter"])}
              disabled={loading || savingTab === "notifications"}
            >
              {savingTab === "notifications" ? "SAVING..." : "SAVE CHANGES"}
            </OrangeButton>
          </div>
        </GlassCard>
      )}

      {activeTab === "shipping" && (
        <GlassCard className="p-6">
          <h3 className="font-display font-bold text-lg text-white mb-6">Shipping Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
            <div>
              <FormLabel>Flat Rate Shipping</FormLabel>
              <DarkTextInput value={storeSettings.shippingFlatRate} onChange={set("shippingFlatRate")} />
              <p className="text-xs text-[#9a9898] mt-1.5">Standard shipping rate in NGN</p>
            </div>
            <div>
              <FormLabel>Free Shipping Threshold</FormLabel>
              <DarkTextInput
                value={storeSettings.freeShippingThreshold}
                onChange={set("freeShippingThreshold")}
              />
              <p className="text-xs text-[#9a9898] mt-1.5">Free shipping for orders above this amount</p>
            </div>
          </div>

          <ToggleRow
            title="Enable Express Shipping"
            description="Offer express delivery option to customers"
            checked={storeSettings.enableExpressShipping}
            onChange={(v) => setStoreSettings((prev) => ({ ...prev, enableExpressShipping: v }))}
          />

          <div className="pt-4">
            <OrangeButton
              onClick={() =>
                saveFields("shipping", ["shippingFlatRate", "freeShippingThreshold", "enableExpressShipping"])
              }
              disabled={loading || savingTab === "shipping"}
            >
              {savingTab === "shipping" ? "SAVING..." : "SAVE CHANGES"}
            </OrangeButton>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
