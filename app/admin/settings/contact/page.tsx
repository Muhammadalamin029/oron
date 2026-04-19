"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Phone, Mail, MapPin, Clock, MessageCircle, Globe } from "lucide-react"
import { settingsApi } from "@/services/settings"

export default function AdminContactSettingsPage() {
  const [contactSettings, setContactSettings] = useState({
    company_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    whatsapp: "",
    business_hours: "",
    support_email: "",
    sales_email: "",
    technical_email: "",
    social_facebook: "",
    social_twitter: "",
    social_instagram: "",
    social_linkedin: "",
    google_maps_embed: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchContactSettings = async () => {
    try {
      const settings = await Promise.all([
        settingsApi.getSetting("company_name"),
        settingsApi.getSetting("contact_email"),
        settingsApi.getSetting("contact_phone"),
        settingsApi.getSetting("contact_address"),
        settingsApi.getSetting("contact_city"),
        settingsApi.getSetting("contact_state"),
        settingsApi.getSetting("contact_country"),
        settingsApi.getSetting("contact_postal_code"),
        settingsApi.getSetting("contact_whatsapp"),
        settingsApi.getSetting("business_hours"),
        settingsApi.getSetting("support_email"),
        settingsApi.getSetting("sales_email"),
        settingsApi.getSetting("technical_email"),
        settingsApi.getSetting("social_facebook"),
        settingsApi.getSetting("social_twitter"),
        settingsApi.getSetting("social_instagram"),
        settingsApi.getSetting("social_linkedin"),
        settingsApi.getSetting("google_maps_embed"),
      ])
      
      setContactSettings({
        company_name: settings[0]?.value || "ORON Watch Marketplace",
        email: settings[1]?.value || "",
        phone: settings[2]?.value || "",
        address: settings[3]?.value || "",
        city: settings[4]?.value || "",
        state: settings[5]?.value || "",
        country: settings[6]?.value || "Nigeria",
        postal_code: settings[7]?.value || "",
        whatsapp: settings[8]?.value || "",
        business_hours: settings[9]?.value || "Monday - Friday: 9am - 6pm WAT",
        support_email: settings[10]?.value || "",
        sales_email: settings[11]?.value || "",
        technical_email: settings[12]?.value || "",
        social_facebook: settings[13]?.value || "",
        social_twitter: settings[14]?.value || "",
        social_instagram: settings[15]?.value || "",
        social_linkedin: settings[16]?.value || "",
        google_maps_embed: settings[17]?.value || "",
      })
    } catch (error) {
      console.error("Failed to fetch contact settings:", error)
      toast.error("Failed to load contact settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContactSettings()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    
    try {
      const settings = Object.entries(contactSettings).map(([key, value]) => {
        const settingKey = key.replace(/_/g, "_")
        return settingsApi.updateSetting(settingKey, {
          value: value,
          description: getSettingDescription(settingKey),
        })
      })
      
      await Promise.all(settings)
      toast.success("Contact settings updated successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update contact settings")
    } finally {
      setSaving(false)
    }
  }

  const getSettingDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      company_name: "Company name displayed on the website",
      contact_email: "Main contact email address",
      contact_phone: "Main contact phone number",
      contact_address: "Physical address",
      contact_city: "City",
      contact_state: "State/Region",
      contact_country: "Country",
      contact_postal_code: "Postal/ZIP code",
      contact_whatsapp: "WhatsApp contact number",
      business_hours: "Business operating hours",
      support_email: "Customer support email",
      sales_email: "Sales inquiry email",
      technical_email: "Technical support email",
      social_facebook: "Facebook profile URL",
      social_twitter: "Twitter profile URL",
      social_instagram: "Instagram profile URL",
      social_linkedin: "LinkedIn profile URL",
      google_maps_embed: "Google Maps embed code",
    }
    return descriptions[key] || "Contact setting"
  }

  const handleInputChange = (key: string, value: string) => {
    setContactSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-96 rounded-md bg-muted/30 animate-pulse" />
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-serif tracking-[0.2em] mb-2">Contact Settings</h1>
              <p className="text-muted-foreground">
                Manage contact information displayed to customers
              </p>
            </div>

            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="emails">Emails</TabsTrigger>
                <TabsTrigger value="social">Social & Maps</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Basic Contact Information
                    </CardTitle>
                    <CardDescription>
                      Core contact details displayed on the contact page
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                          id="company_name"
                          value={contactSettings.company_name}
                          onChange={(e) => handleInputChange("company_name", e.target.value)}
                          placeholder="ORON Watch Marketplace"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={contactSettings.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+234 800 123 4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Main Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactSettings.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="info@oron.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          value={contactSettings.whatsapp}
                          onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                          placeholder="+234 800 123 4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_hours">Business Hours</Label>
                      <Input
                        id="business_hours"
                        value={contactSettings.business_hours}
                        onChange={(e) => handleInputChange("business_hours", e.target.value)}
                        placeholder="Monday - Friday: 9am - 6pm WAT"
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Address Information</h4>
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          value={contactSettings.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="123 Victoria Island"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={contactSettings.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            placeholder="Lagos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={contactSettings.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                            placeholder="Lagos State"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">Postal Code</Label>
                          <Input
                            id="postal_code"
                            value={contactSettings.postal_code}
                            onChange={(e) => handleInputChange("postal_code", e.target.value)}
                            placeholder="100001"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={contactSettings.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          placeholder="Nigeria"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="emails">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Addresses
                    </CardTitle>
                    <CardDescription>
                      Department-specific email addresses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="support_email">Support Email</Label>
                        <Input
                          id="support_email"
                          type="email"
                          value={contactSettings.support_email}
                          onChange={(e) => handleInputChange("support_email", e.target.value)}
                          placeholder="support@oron.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sales_email">Sales Email</Label>
                        <Input
                          id="sales_email"
                          type="email"
                          value={contactSettings.sales_email}
                          onChange={(e) => handleInputChange("sales_email", e.target.value)}
                          placeholder="sales@oron.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="technical_email">Technical Support Email</Label>
                        <Input
                          id="technical_email"
                          type="email"
                          value={contactSettings.technical_email}
                          onChange={(e) => handleInputChange("technical_email", e.target.value)}
                          placeholder="tech@oron.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Social Media & Maps
                    </CardTitle>
                    <CardDescription>
                      Social media links and Google Maps integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Social Media</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="social_facebook">Facebook</Label>
                          <Input
                            id="social_facebook"
                            value={contactSettings.social_facebook}
                            onChange={(e) => handleInputChange("social_facebook", e.target.value)}
                            placeholder="https://facebook.com/oronwatches"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="social_twitter">Twitter</Label>
                          <Input
                            id="social_twitter"
                            value={contactSettings.social_twitter}
                            onChange={(e) => handleInputChange("social_twitter", e.target.value)}
                            placeholder="https://twitter.com/oronwatches"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="social_instagram">Instagram</Label>
                          <Input
                            id="social_instagram"
                            value={contactSettings.social_instagram}
                            onChange={(e) => handleInputChange("social_instagram", e.target.value)}
                            placeholder="https://instagram.com/oronwatches"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="social_linkedin">LinkedIn</Label>
                          <Input
                            id="social_linkedin"
                            value={contactSettings.social_linkedin}
                            onChange={(e) => handleInputChange("social_linkedin", e.target.value)}
                            placeholder="https://linkedin.com/company/oronwatches"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Google Maps</h4>
                      <div className="space-y-2">
                        <Label htmlFor="google_maps_embed">Google Maps Embed Code</Label>
                        <Textarea
                          id="google_maps_embed"
                          value={contactSettings.google_maps_embed}
                          onChange={(e) => handleInputChange("google_maps_embed", e.target.value)}
                          placeholder="Paste Google Maps embed iframe code here..."
                          rows={4}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Get the embed code from Google Maps by searching your location and clicking "Share" {">"} "Embed a map"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save All Settings"}
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/contact"}>
                View Contact Page
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
