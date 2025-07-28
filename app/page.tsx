"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function StartPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    // Store email in localStorage for the quiz
    localStorage.setItem("userEmail", email)

    // Navigate to quiz
    router.push("/quiz")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-blue-600">CausalFunnel</h1>
          </div>
          <CardTitle className="text-2xl">Quiz Application</CardTitle>
          <CardDescription>
            Welcome! Please enter your email address to begin the 15-question quiz. You'll have 30 minutes to complete
            it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStart} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!email || isLoading}>
              {isLoading ? "Starting Quiz..." : "Start Quiz"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
