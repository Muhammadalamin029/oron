"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ProfileSection } from "@/components/account/profile-section"
import { PasswordSection } from "@/components/account/password-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Settings, MapPin } from "lucide-react"
import { PreferencesSection } from "@/components/account/preferences-section"
import { AddressesSection } from "@/components/account/addresses-section"
import { SiteMain, PageHeading } from "@/components/site-ui"

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <SiteMain>
          <div className="max-w-4xl mx-auto">
            <PageHeading sub="Manage your profile, preferences, and account settings">
              My Account
            </PageHeading>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:text-primary">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:text-primary">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Password</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2 data-[state=active]:text-primary">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
                <TabsTrigger value="addresses" className="flex items-center gap-2 data-[state=active]:text-primary">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Addresses</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileSection />
              </TabsContent>

              <TabsContent value="password">
                <PasswordSection />
              </TabsContent>

              <TabsContent value="preferences">
                <PreferencesSection />
              </TabsContent>

              <TabsContent value="addresses">
                <AddressesSection />
              </TabsContent>
            </Tabs>
          </div>
        </SiteMain>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
