"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Shield } from "lucide-react"
import { settingsApi } from "@/services/settings"
import { toast } from "sonner"

export default function TermsPage() {
  const [termsContent, setTermsContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState("")

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const terms = await settingsApi.getSetting("terms_of_service")
        if (terms) {
          setTermsContent(terms.value)
          setLastUpdated(terms.updated_at ? new Date(terms.updated_at).toLocaleDateString() : "")
        } else {
          setTermsContent(getDefaultTermsContent())
        }
      } catch (error) {
        console.error("Failed to fetch terms:", error)
        setTermsContent(getDefaultTermsContent())
        toast.error("Failed to load terms of service")
      } finally {
        setLoading(false)
      }
    }

    fetchTerms()
  }, [])

  const getDefaultTermsContent = () => {
    return `
      <h2>Terms of Service</h2>
      <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing and using ORON Watch Marketplace, you accept and agree to be bound by the terms and provision of this agreement.</p>
      
      <h3>2. Use License</h3>
      <p>Permission is granted to temporarily download one copy of the materials on ORON Watch Marketplace for personal, non-commercial transitory viewing only.</p>
      
      <h3>3. Disclaimer</h3>
      <p>The materials on ORON Watch Marketplace are provided on an 'as is' basis. ORON makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
      
      <h3>4. Limitations</h3>
      <p>In no event shall ORON or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ORON Watch Marketplace.</p>
      
      <h3>5. Privacy Policy</h3>
      <p>Your Privacy is important to ORON. Our Privacy Policy is available at our website and outlines how we collect, use, and protect your information.</p>
      
      <h3>6. Revisions and Errata</h3>
      <p>The materials appearing on ORON Watch Marketplace could include technical, typographical, or photographic errors. ORON does not promise that any of the materials on its website are accurate, complete, or current.</p>
      
      <h3>7. Governing Law</h3>
      <p>These terms and conditions are governed by and construed in accordance with the laws of Nigeria and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.</p>
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
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-serif tracking-[0.2em]">Terms of Service</h1>
            </div>
            <p className="text-muted-foreground">
              Please read these terms carefully before using our marketplace
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Legal Agreement
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
                dangerouslySetInnerHTML={{ __html: termsContent }}
              />
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            <Button onClick={() => window.location.href = "/contact"}>
              Contact Support
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
