"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { FileText, Shield, Package } from "lucide-react"
import { settingsApi } from "@/services/settings"

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState({
    terms_of_service: "",
    privacy_policy: "",
    return_policy: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({})

  const fetchPolicies = async () => {
    try {
      const [terms, privacy, returns] = await Promise.all([
        settingsApi.getSetting("terms_of_service"),
        settingsApi.getSetting("privacy_policy"),
        settingsApi.getSetting("return_policy"),
      ])
      
      setPolicies({
        terms_of_service: terms?.value || "",
        privacy_policy: privacy?.value || "",
        return_policy: returns?.value || "",
      })
    } catch (error) {
      console.error("Failed to fetch policies:", error)
      toast.error("Failed to load policies")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  const handleSavePolicy = async (policyKey: string, content: string) => {
    setSaving(prev => ({ ...prev, [policyKey]: true }))
    
    try {
      await settingsApi.updateSetting(policyKey, {
        value: content,
        description: getPolicyDescription(policyKey),
      })
      toast.success(`${getPolicyName(policyKey)} updated successfully`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update policy")
    } finally {
      setSaving(prev => ({ ...prev, [policyKey]: false }))
    }
  }

  const getPolicyName = (key: string) => {
    switch (key) {
      case "terms_of_service": return "Terms of Service"
      case "privacy_policy": return "Privacy Policy"
      case "return_policy": return "Return Policy"
      default: return "Policy"
    }
  }

  const getPolicyDescription = (key: string) => {
    switch (key) {
      case "terms_of_service": return "Terms and conditions for using ORON marketplace"
      case "privacy_policy": return "Privacy policy and data handling practices"
      case "return_policy": return "Product return and refund policy"
      default: return "Policy document"
    }
  }

  const getPolicyIcon = (key: string) => {
    switch (key) {
      case "terms_of_service": return <FileText className="h-4 w-4" />
      case "privacy_policy": return <Shield className="h-4 w-4" />
      case "return_policy": return <Package className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
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
              <h1 className="text-3xl font-serif tracking-[0.2em] mb-2">Policy Management</h1>
              <p className="text-muted-foreground">
                Manage and edit legal policies displayed to customers
              </p>
            </div>

            <Tabs defaultValue="terms_of_service" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="terms_of_service" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </TabsTrigger>
                <TabsTrigger value="privacy_policy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </TabsTrigger>
                <TabsTrigger value="return_policy" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Return Policy
                </TabsTrigger>
              </TabsList>

              {Object.entries(policies).map(([key, content]) => (
                <TabsContent key={key} value={key}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getPolicyIcon(key)}
                        {getPolicyName(key)}
                      </CardTitle>
                      <CardDescription>
                        Edit the {getPolicyName(key).toLowerCase()} that will be displayed to customers
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor={key}>Policy Content</Label>
                        <Textarea
                          id={key}
                          value={content}
                          onChange={(e) => setPolicies(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={`Enter the ${getPolicyName(key).toLowerCase()} content...`}
                          rows={20}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          You can use HTML formatting for better presentation. This content will be displayed on the public policy pages.
                        </p>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Preview:</h4>
                        <div className="border rounded-md p-4 bg-white max-h-64 overflow-y-auto">
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: content || "<p>No content yet...</p>" }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleSavePolicy(key, content)}
                          disabled={saving[key]}
                        >
                          {saving[key] ? "Saving..." : `Save ${getPolicyName(key)}`}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => window.open(`/${key.replace('_', '-')}`, '_blank')}
                        >
                          View Live Page
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
