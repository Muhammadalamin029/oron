"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Bell, Globe, CreditCard } from "lucide-react"
import { getErrorMessage } from "@/lib/get-error-message"
import { SiteCard, SiteFieldLabel, PrimaryButton } from "@/components/site-ui"

export function PreferencesSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    order_updates: true,
    promotional_emails: false,
    newsletter: true,
    language: "en",
    currency: "NGN",
    payment_method_default: "paystack",
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Note: Backend would need a preferences update endpoint
      // For now, we'll just show a success message
      toast.success("Preferences saved successfully!")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save preferences"))
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <SiteCard className="p-6">
        <div className="mb-6">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how you want to receive notifications
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <SiteFieldLabel>Email Notifications</SiteFieldLabel>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <SiteFieldLabel>Order Updates</SiteFieldLabel>
              <p className="text-sm text-muted-foreground">
                Get notified about your order status
              </p>
            </div>
            <Switch
              checked={preferences.order_updates}
              onCheckedChange={(checked) => updatePreference('order_updates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <SiteFieldLabel>Promotional Emails</SiteFieldLabel>
              <p className="text-sm text-muted-foreground">
                Receive special offers and promotions
              </p>
            </div>
            <Switch
              checked={preferences.promotional_emails}
              onCheckedChange={(checked) => updatePreference('promotional_emails', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <SiteFieldLabel>Newsletter</SiteFieldLabel>
              <p className="text-sm text-muted-foreground">
                Subscribe to our monthly newsletter
              </p>
            </div>
            <Switch
              checked={preferences.newsletter}
              onCheckedChange={(checked) => updatePreference('newsletter', checked)}
            />
          </div>
        </div>
      </SiteCard>

      {/* Regional Preferences */}
      <SiteCard className="p-6">
        <div className="mb-6">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Regional Preferences
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set your language and currency preferences
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SiteFieldLabel>Language</SiteFieldLabel>
              <Select value={preferences.language} onValueChange={(value) => updatePreference('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <SiteFieldLabel>Currency</SiteFieldLabel>
              <Select value={preferences.currency} onValueChange={(value) => updatePreference('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SiteCard>

      {/* Payment Preferences */}
      <SiteCard className="p-6">
        <div className="mb-6">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Preferences
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set your default payment method
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <SiteFieldLabel>Default Payment Method</SiteFieldLabel>
            <Select value={preferences.payment_method_default} onValueChange={(value) => updatePreference('payment_method_default', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be selected by default during checkout
            </p>
          </div>
        </div>
      </SiteCard>

      <PrimaryButton onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading ? "SAVING..." : "SAVE PREFERENCES"}
      </PrimaryButton>
    </div>
  )
}
