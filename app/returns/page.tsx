"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Calendar, RefreshCw } from "lucide-react"
import { settingsApi } from "@/services/settings"
import { toast } from "sonner"

export default function ReturnsPage() {
  const [returnsContent, setReturnsContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState("")

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const returns = await settingsApi.getSetting("return_policy")
        if (returns) {
          setReturnsContent(returns.value)
          setLastUpdated(returns.updated_at ? new Date(returns.updated_at).toLocaleDateString() : "")
        } else {
          setReturnsContent(getDefaultReturnsContent())
        }
      } catch (error) {
        console.error("Failed to fetch return policy:", error)
        setReturnsContent(getDefaultReturnsContent())
        toast.error("Failed to load return policy")
      } finally {
        setLoading(false)
      }
    }

    fetchReturns()
  }, [])

  const getDefaultReturnsContent = () => {
    return `
      <h2>Return Policy</h2>
      <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
      
      <h3>1. 14-Day Return Policy</h3>
      <p>At ORON Watch Marketplace, we want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 14 days of delivery.</p>
      
      <h3>2. Eligibility for Returns</h3>
      <p>To be eligible for a return, your item must meet the following criteria:</p>
      <ul>
        <li>The item must be unused and in the same condition that you received it</li>
        <li>The item must be in the original packaging</li>
        <li>All tags and protective covers must be intact</li>
        <li>The return must be initiated within 14 days of delivery</li>
        <li>Proof of purchase (order confirmation or receipt) must be provided</li>
      </ul>
      
      <h3>3. Non-Returnable Items</h3>
      <p>The following items cannot be returned:</p>
      <ul>
        <li>Customized or personalized watches</li>
        <li>Items damaged due to customer misuse</li>
        <li>Items with missing parts or accessories</li>
        <li>Items returned after 14 days from delivery</li>
      </ul>
      
      <h3>4. How to Initiate a Return</h3>
      <p>To start a return, follow these steps:</p>
      <ol>
        <li>Contact our customer support at returns@oron.com</li>
        <li>Provide your order number and reason for return</li>
        <li>Our team will review your request and provide return instructions</li>
        <li>Pack the item securely in its original packaging</li>
        <li>Ship the item using the provided return label</li>
      </ol>
      
      <h3>5. Refund Process</h3>
      <p>Once we receive your returned item:</p>
      <ul>
        <li>Our team will inspect the item within 3-5 business days</li>
        <li>If approved, your refund will be processed within 5-7 business days</li>
        <li>Refunds will be issued to your original payment method</li>
        <li>You'll receive an email confirmation when your refund is processed</li>
      </ul>
      
      <h3>6. Shipping Costs</h3>
      <ul>
        <li><strong>Defective Items:</strong> We cover all shipping costs for defective or incorrect items</li>
        <li><strong>Change of Mind:</strong> Customer is responsible for return shipping costs</li>
        <li><strong>Damaged in Transit:</strong> Contact us immediately for assistance</li>
      </ul>
      
      <h3>7. Exchanges</h3>
      <p>If you'd like to exchange your item for a different model or size:</p>
      <ul>
        <li>Follow the same return process as above</li>
        <li>Specify the item you'd like to exchange for</li>
        <li>Price differences will be handled accordingly</li>
        <li>Exchange processing time is typically 7-10 business days</li>
      </ul>
      
      <h3>8. Warranty Claims</h3>
      <p>All ORON watches come with a 2-year manufacturer warranty:</p>
      <ul>
        <li>Covers manufacturing defects and mechanical failures</li>
        <li>Does not cover damage from misuse, accidents, or normal wear</li>
        <li>Warranty service is provided through authorized service centers</li>
        <li>Contact warranty@oron.com for warranty claims</li>
      </ul>
      
      <h3>9. International Returns</h3>
      <p>For international customers:</p>
      <ul>
        <li>Return policies may vary by country</li>
        <li>Customs and import duties may apply</li>
        <li>International shipping times are longer</li>
        <li>Contact international@oron.com for assistance</li>
      </ul>
      
      <h3>10. Contact Information</h3>
      <p>For any questions about our return policy:</p>
      <ul>
        <li>Email: returns@oron.com</li>
        <li>Phone: +234 800 123 4567</li>
        <li>Hours: Monday - Friday, 9am - 6pm WAT</li>
      </ul>
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
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-serif tracking-[0.2em]">Return Policy</h1>
            </div>
            <p className="text-muted-foreground">
              Our commitment to your satisfaction with hassle-free returns
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Easy Returns, Guaranteed Satisfaction
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
                dangerouslySetInnerHTML={{ __html: returnsContent }}
              />
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">14 Days</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Return window for all purchases</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Full Refund</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Money back guarantee</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">2 Years</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Manufacturer warranty</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Need help with a return? Our customer service team is here for you.
            </p>
            <Button onClick={() => window.location.href = "/support"}>
              Start a Return
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
