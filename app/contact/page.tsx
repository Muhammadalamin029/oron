"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { MapPin, Phone, Mail, Clock, MessageCircle, Globe } from "lucide-react"
import { settingsApi } from "@/services/settings"

interface ContactSettings {
  company_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  whatsapp: string
  business_hours: string
  support_email: string
  sales_email: string
  technical_email: string
  social_facebook: string
  social_twitter: string
  social_instagram: string
  social_linkedin: string
  google_maps_embed: string
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    company_name: "ORON Watch Marketplace",
    email: "contact@oron.com",
    phone: "+234 800 123 4567",
    address: "",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    postal_code: "100001",
    whatsapp: "",
    business_hours: "Monday - Friday: 9am - 6pm WAT",
    support_email: "support@oron.com",
    sales_email: "sales@oron.com",
    technical_email: "tech@oron.com",
    social_facebook: "",
    social_twitter: "",
    social_instagram: "",
    social_linkedin: "",
    google_maps_embed: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
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
          email: settings[1]?.value || "contact@oron.com",
          phone: settings[2]?.value || "+234 800 123 4567",
          address: settings[3]?.value || "",
          city: settings[4]?.value || "Lagos",
          state: settings[5]?.value || "Lagos State",
          country: settings[6]?.value || "Nigeria",
          postal_code: settings[7]?.value || "100001",
          whatsapp: settings[8]?.value || "",
          business_hours: settings[9]?.value || "Monday - Friday: 9am - 6pm WAT",
          support_email: settings[10]?.value || "support@oron.com",
          sales_email: settings[11]?.value || "sales@oron.com",
          technical_email: settings[12]?.value || "tech@oron.com",
          social_facebook: settings[13]?.value || "",
          social_twitter: settings[14]?.value || "",
          social_instagram: settings[15]?.value || "",
          social_linkedin: settings[16]?.value || "",
          google_maps_embed: settings[17]?.value || "",
        })
      } catch (error) {
        console.error("Failed to fetch contact settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContactSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    toast.success("Message sent successfully! We'll get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" })
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions about our watches or need assistance with an order?
            We&apos;re here to help. Reach out to us and we&apos;ll respond as
            soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-card rounded-lg border border-border p-8">
              <h2 className="text-xl font-semibold text-card-foreground mb-6">
                Send us a message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-8">
              <h2 className="text-xl font-semibold text-card-foreground mb-6">
                Get in touch
              </h2>
              <div className="space-y-6">
                {(contactSettings.address || contactSettings.city || contactSettings.state) && (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-card-foreground">Address</h3>
                      <div className="text-sm text-muted-foreground">
                        {contactSettings.address && <p>{contactSettings.address}</p>}
                        {contactSettings.city && contactSettings.state && (
                          <p>{contactSettings.city}, {contactSettings.state}</p>
                        )}
                        {contactSettings.country && <p>{contactSettings.country}</p>}
                        {contactSettings.postal_code && <p>{contactSettings.postal_code}</p>}
                      </div>
                    </div>
                  </div>
                )}
                
                {contactSettings.phone && (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-card-foreground">Phone</h3>
                      <div className="text-sm text-muted-foreground">
                        <p>{contactSettings.phone}</p>
                        {contactSettings.whatsapp && <p>WhatsApp: {contactSettings.whatsapp}</p>}
                      </div>
                    </div>
                  </div>
                )}
                
                {(contactSettings.email || contactSettings.support_email) && (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-card-foreground">Email</h3>
                      <div className="text-sm text-muted-foreground">
                        {contactSettings.email && <p>{contactSettings.email}</p>}
                        {contactSettings.support_email && <p>Support: {contactSettings.support_email}</p>}
                        {contactSettings.sales_email && <p>Sales: {contactSettings.sales_email}</p>}
                      </div>
                    </div>
                  </div>
                )}
                
                {contactSettings.business_hours && (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-card-foreground">Business Hours</h3>
                      <p className="text-sm text-muted-foreground">{contactSettings.business_hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(contactSettings.social_facebook || contactSettings.social_twitter || contactSettings.social_instagram || contactSettings.social_linkedin) && (
              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-xl font-semibold text-card-foreground mb-6">
                  Connect with us
                </h2>
                <div className="flex gap-4">
                  {contactSettings.social_facebook && (
                    <a
                      href={contactSettings.social_facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                    </a>
                  )}
                  {contactSettings.social_twitter && (
                    <a
                      href={contactSettings.social_twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                    </a>
                  )}
                  {contactSettings.social_instagram && (
                    <a
                      href={contactSettings.social_instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                    </a>
                  )}
                  {contactSettings.social_linkedin && (
                    <a
                      href={contactSettings.social_linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {contactSettings.google_maps_embed && (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-8">
                  <h2 className="text-xl font-semibold text-card-foreground mb-4">
                    Find us on the map
                  </h2>
                </div>
                <div 
                  className="w-full h-64"
                  dangerouslySetInnerHTML={{ __html: contactSettings.google_maps_embed }}
                />
              </div>
            )}

            <div className="bg-card rounded-lg border border-border p-8">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-card-foreground">
                    What is your return policy?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We offer a 14-day return policy for unworn watches in
                    original packaging.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-card-foreground">
                    Do you ship nationwide?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, we deliver to all states in Nigeria. Orders above
                    ₦100,000 qualify for free shipping.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-card-foreground">
                    How long is the warranty?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All ORON watches come with a 2-year warranty covering
                    manufacturing defects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
