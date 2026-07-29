"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { authApi } from "@/services/auth"
import { getErrorMessage } from "@/lib/get-error-message"
import { SiteCard, SiteInput, SiteFieldLabel, PrimaryButton, SecondaryButton } from "@/components/site-ui"

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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update profile"))
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
    <SiteCard className="p-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-white">Personal Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal details and contact information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SiteFieldLabel htmlFor="full_name">Full Name</SiteFieldLabel>
            <SiteInput
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="space-y-2">
            <SiteFieldLabel htmlFor="email">Email Address</SiteFieldLabel>
            <SiteInput
              id="email"
              type="email"
              value={formData.email}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <SiteFieldLabel>Account Status</SiteFieldLabel>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${user?.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-foreground">
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
          <SiteFieldLabel>Account Type</SiteFieldLabel>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {user?.is_admin ? 'Administrator' : 'Customer'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <SiteFieldLabel>Member Since</SiteFieldLabel>
          <p className="text-sm text-muted-foreground">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          {!isEditing ? (
            <PrimaryButton type="button" onClick={() => setIsEditing(true)}>
              EDIT PROFILE
            </PrimaryButton>
          ) : (
            <>
              <PrimaryButton type="submit" disabled={isLoading}>
                {isLoading ? "SAVING..." : "SAVE CHANGES"}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={handleCancel}>
                CANCEL
              </SecondaryButton>
            </>
          )}
        </div>
      </form>
    </SiteCard>
  )
}
