"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ProfileSection } from "@/components/account/profile-section"
import { PasswordSection } from "@/components/account/password-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Settings, MapPin } from "lucide-react"
import { PreferencesSection } from "@/components/account/preferences-section"
import { AddressesSection } from "@/components/account/addresses-section"

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-serif tracking-[0.2em] mb-2">My Account</h1>
              <p className="text-muted-foreground">
                Manage your profile, preferences, and account settings
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Password</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
                <TabsTrigger value="addresses" className="flex items-center gap-2">
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
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
