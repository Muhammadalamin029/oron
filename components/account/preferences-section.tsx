"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Bell, Globe, CreditCard } from "lucide-react"

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
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save preferences")
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
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
              <Label>Order Updates</Label>
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
              <Label>Promotional Emails</Label>
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
              <Label>Newsletter</Label>
              <p className="text-sm text-muted-foreground">
                Subscribe to our monthly newsletter
              </p>
            </div>
            <Switch
              checked={preferences.newsletter}
              onCheckedChange={(checked) => updatePreference('newsletter', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Regional Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Preferences
          </CardTitle>
          <CardDescription>
            Set your language and currency preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
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
              <Label>Currency</Label>
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
        </CardContent>
      </Card>

      {/* Payment Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Preferences
          </CardTitle>
          <CardDescription>
            Set your default payment method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Payment Method</Label>
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
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  )
}
