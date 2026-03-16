"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "ORON",
    storeEmail: "contact@oron.com",
    storePhone: "+234 800 123 4567",
    currency: "NGN",
    enableNotifications: true,
    enableNewsletter: true,
    maintenanceMode: false,
  })

  const handleSave = () => {
    toast.success("Settings saved successfully")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        storeName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        storeEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Store Phone</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.storePhone}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        storePhone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={storeSettings.currency}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        currency: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-border">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable your store for maintenance
                  </p>
                </div>
                <Switch
                  checked={storeSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setStoreSettings({
                      ...storeSettings,
                      maintenanceMode: checked,
                    })
                  }
                />
              </div>

              <Button
                onClick={handleSave}
                className="bg-primary text-primary-foreground"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <p className="font-medium">Order Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for new orders
                  </p>
                </div>
                <Switch
                  checked={storeSettings.enableNotifications}
                  onCheckedChange={(checked) =>
                    setStoreSettings({
                      ...storeSettings,
                      enableNotifications: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <p className="font-medium">Newsletter Subscriptions</p>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to subscribe to your newsletter
                  </p>
                </div>
                <Switch
                  checked={storeSettings.enableNewsletter}
                  onCheckedChange={(checked) =>
                    setStoreSettings({
                      ...storeSettings,
                      enableNewsletter: checked,
                    })
                  }
                />
              </div>

              <Button
                onClick={handleSave}
                className="bg-primary text-primary-foreground"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Flat Rate Shipping</Label>
                  <Input defaultValue="2500" />
                  <p className="text-sm text-muted-foreground">
                    Standard shipping rate in NGN
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Free Shipping Threshold</Label>
                  <Input defaultValue="100000" />
                  <p className="text-sm text-muted-foreground">
                    Free shipping for orders above this amount
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-border">
                <div>
                  <p className="font-medium">Enable Express Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    Offer express delivery option to customers
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button
                onClick={handleSave}
                className="bg-primary text-primary-foreground"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
