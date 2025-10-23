"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"

interface Message {
  id: string
  username: string
  content: string
  timestamp: number
}

export default function RealtimeMessagesPage() {
  const { user, isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isAuthenticated) return

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}/api/ws`

    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setIsConnected(true)
        toast.success("Connected to real-time chat")
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        setMessages((prev) => [...prev, message])
      }

      ws.onerror = () => {
        setIsConnected(false)
        toast.error("Connection error")
      }

      ws.onclose = () => {
        setIsConnected(false)
        setTimeout(connectWebSocket, 3000)
      }

      wsRef.current = ws
    }

    connectWebSocket()

    return () => {
      wsRef.current?.close()
    }
  }, [isAuthenticated])

  const sendMessage = () => {
    if (!inputMessage.trim() || !wsRef.current || !user) return

    const message: Message = {
      id: Date.now().toString(),
      username: user.username,
      content: inputMessage,
      timestamp: Date.now(),
    }

    wsRef.current.send(JSON.stringify(message))
    setInputMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please log in to access real-time chat</h2>
            <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Real-Time Messages</h1>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-gray-400">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>

          <div className="h-[500px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-zinc-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-blue-400">{msg.username}</span>
                    <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-gray-200">{msg.content}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                disabled={!isConnected}
              />
              <Button onClick={sendMessage} disabled={!isConnected || !inputMessage.trim()}>
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
