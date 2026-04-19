"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authApi } from "@/services/auth"

export function ProfileSection() {
  const { user, setUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updatedUser = await authApi.updateProfile({
        full_name: formData.full_name.trim()
      })
      
      // Update user state in auth context
      setUser(updatedUser)
      
      toast.success("Profile updated successfully!")
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      email: user?.email || "",
    })
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled={!isEditing}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Account Status</Label>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user?.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm">
                {user?.is_verified ? 'Verified' : 'Email not verified'}
              </span>
            </div>
            {!user?.is_verified && (
              <p className="text-xs text-muted-foreground">
                Verify your email to unlock all features
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {user?.is_admin ? 'Administrator' : 'Customer'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <p className="text-sm text-muted-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
