"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SecuritySettings() {
  const { toast } = useToast()
  const [isChanging, setIsChanging] = useState(false)
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validatePasswords = () => {
    const newErrors: Record<string, string> = {}

    if (!passwords.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = async () => {
    if (!validatePasswords()) return

    setIsChanging(true)

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      toast({
        title: "Success!",
        description: "Your password has been changed successfully",
      })

      // Reset form
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setErrors({})
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription className="text-purple-300">
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-white">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
              className={`bg-slate-700/50 border-purple-800/30 text-white ${
                errors.currentPassword ? "border-red-500" : ""
              }`}
              placeholder="Enter your current password"
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-white">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
              className={`bg-slate-700/50 border-purple-800/30 text-white ${
                errors.newPassword ? "border-red-500" : ""
              }`}
              placeholder="Enter your new password (min 6 characters)"
            />
            {errors.newPassword && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errors.newPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              className={`bg-slate-700/50 border-purple-800/30 text-white ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
            {!errors.confirmPassword &&
              passwords.confirmPassword &&
              passwords.newPassword === passwords.confirmPassword && (
                <p className="text-sm text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Passwords match
                </p>
              )}
          </div>
        </div>

        <Button
          onClick={handleChangePassword}
          disabled={isChanging}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isChanging ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Changing Password...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </>
          )}
        </Button>

        <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
          <p className="text-sm text-blue-300">
            <strong>💡 Security Tips:</strong>
          </p>
          <ul className="mt-2 text-sm text-blue-300/80 space-y-1 list-disc list-inside">
            <li>Use at least 8 characters with mixed case and numbers</li>
            <li>Don't reuse passwords from other websites</li>
            <li>Consider using a password manager</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
