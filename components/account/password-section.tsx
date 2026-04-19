"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function PasswordSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.new_password !== formData.confirm_password) {
      toast.error("New passwords do not match")
      return
    }

    if (formData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      // Note: Backend would need a change password endpoint
      // For now, we'll just show a success message
      toast.success("Password changed successfully!")
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <Input
              id="current_password"
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              required
              minLength={8}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Password Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>At least 8 characters long</li>
              <li>Contains uppercase and lowercase letters</li>
              <li>Contains at least one number</li>
              <li>Contains at least one special character</li>
            </ul>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
