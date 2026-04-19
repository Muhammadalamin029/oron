"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Calendar, Eye } from "lucide-react"
import { settingsApi } from "@/services/settings"
import { toast } from "sonner"

export default function PrivacyPage() {
  const [privacyContent, setPrivacyContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState("")

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const privacy = await settingsApi.getSetting("privacy_policy")
        if (privacy) {
          setPrivacyContent(privacy.value)
          setLastUpdated(privacy.updated_at ? new Date(privacy.updated_at).toLocaleDateString() : "")
        } else {
          setPrivacyContent(getDefaultPrivacyContent())
        }
      } catch (error) {
        console.error("Failed to fetch privacy policy:", error)
        setPrivacyContent(getDefaultPrivacyContent())
        toast.error("Failed to load privacy policy")
      } finally {
        setLoading(false)
      }
    }

    fetchPrivacy()
  }, [])

  const getDefaultPrivacyContent = () => {
    return `
      <h2>Privacy Policy</h2>
      <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
      
      <h3>1. Information We Collect</h3>
      <p>When you visit ORON Watch Marketplace, we collect information to provide better services to all our users.</p>
      <ul>
        <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address</li>
        <li><strong>Order Information:</strong> Purchase history, product preferences, payment details</li>
        <li><strong>Technical Information:</strong> IP address, browser type, device information</li>
        <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
      </ul>
      
      <h3>2. How We Use Your Information</h3>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Process and fulfill your orders</li>
        <li>Provide customer support</li>
        <li>Improve our products and services</li>
        <li>Send transactional emails and notifications</li>
        <li>Detect and prevent fraud</li>
        <li>Comply with legal obligations</li>
      </ul>
      
      <h3>3. Information Sharing</h3>
      <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:</p>
      <ul>
        <li><strong>Service Providers:</strong> Trusted partners who assist in operating our platform</li>
        <li><strong>Payment Processors:</strong> For processing payments securely</li>
        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
      </ul>
      
      <h3>4. Data Security</h3>
      <p>We implement appropriate security measures to protect your personal information:</p>
      <ul>
        <li>SSL encryption for data transmission</li>
        <li>Secure payment processing</li>
        <li>Regular security audits</li>
        <li>Employee access controls</li>
      </ul>
      
      <h3>5. Your Rights</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal information</li>
        <li>Correct inaccurate information</li>
        <li>Delete your account and data</li>
        <li>Opt-out of marketing communications</li>
        <li>Request data portability</li>
      </ul>
      
      <h3>6. Cookies and Tracking</h3>
      <p>We use cookies and similar technologies to:</p>
      <ul>
        <li>Remember your preferences</li>
        <li>Analyze website traffic</li>
        <li>Provide personalized content</li>
        <li>Improve user experience</li>
      </ul>
      
      <h3>7. Children's Privacy</h3>
      <p>Our services are not intended for children under 18. We do not knowingly collect personal information from children under 18.</p>
      
      <h3>8. Changes to This Policy</h3>
      <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
      
      <h3>9. Contact Information</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at privacy@oron.com</p>
    `
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-8 rounded-md bg-muted/30 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-serif tracking-[0.2em]">Privacy Policy</h1>
            </div>
            <p className="text-muted-foreground">
              How we collect, use, and protect your personal information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Your Privacy Matters
              </CardTitle>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Last updated: {lastUpdated}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: privacyContent }}
              />
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Questions about your privacy? We're here to help.
            </p>
            <Button onClick={() => window.location.href = "/contact"}>
              Contact Privacy Team
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
