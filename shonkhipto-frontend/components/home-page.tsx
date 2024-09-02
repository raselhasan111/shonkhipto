'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ClipboardIcon, ExternalLinkIcon } from 'lucide-react'

export function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [longUrl, setLongUrl] = useState('')
  const [shortUrls, setShortUrls] = useState([
    { id: 1, original: 'https://www.example.com/very/long/url/1', short: 'https://tinylink.com/abc123', clicks: 15 },
    { id: 2, original: 'https://www.example.com/another/long/url/2', short: 'https://tinylink.com/def456', clicks: 8 },
  ])

  const handleCreateShortUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (longUrl) {
      const newShortUrl = {
        id: shortUrls.length + 1,
        original: longUrl,
        short: `https://tinylink.com/${Math.random().toString(36).substr(2, 6)}`,
        clicks: 0
      }
      setShortUrls([newShortUrl, ...shortUrls])
      setLongUrl('')
    }
  }

  const handleCopyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        // You might want to show a toast notification here
        console.log('URL copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err)
      })
  }

  const handleLogin = () => {
    // Simulating login process
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    // Simulating logout process
    setIsLoggedIn(false)
  }

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto px-6 bg-white shadow-md flex flex-col">
        <header className="w-full mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">সংক্ষিপ্ত <span className='text-xs font-normal'>url-shortener</span></h1>
        {isLoggedIn ? (
          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        ) : (
          <Button 
            variant="outline" 
            className="h-9 px-3 bg-white text-black border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200"
            onClick={handleLogin}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              <span className="text-sm font-medium">Login with Google</span>
            </div>
          </Button>
        )}
      </header>
      <main className="flex-grow flex items-center justify-center p-4  flex-col space-y-6 max-w-6xl mx-auto w-full">
        {isLoggedIn ? <><Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Create Short URL</CardTitle>
            <CardDescription>Enter a long URL to generate a short link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateShortUrl} className="flex space-x-2">
              <Input 
                type="url" 
                placeholder="Enter your long URL here" 
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit">Shorten URL</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Your Short URLs</CardTitle>
            <CardDescription>Manage and track your shortened URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Original URL</TableHead>
                  <TableHead>Short URL</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortUrls.map((url) => (
                  <TableRow key={url.id}>
                    <TableCell className="font-medium truncate max-w-xs" title={url.original}>
                      {url.original}
                    </TableCell>
                    <TableCell>{url.short}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{url.clicks} clicks</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCopyToClipboard(url.short)}
                        >
                          <ClipboardIcon className="h-4 w-4" />
                          <span className="sr-only">Copy short URL</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          asChild
                        >
                          <a href={url.short} target="_blank" rel="noopener noreferrer">
                            <ExternalLinkIcon className="h-4 w-4" />
                            <span className="sr-only">Open short URL</span>
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card></>: <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Shorten Your URL</CardTitle>
            <CardDescription className="text-center text-gray-600">
              {isLoggedIn 
                ? "Enter a long URL to create a short link" 
                : "Login with Google to start shortening URLs"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoggedIn ? (
              <form className="space-y-4">
                <Input 
                  type="url" 
                  placeholder="Enter your long URL here" 
                  className="w-full"
                />
                <Button className="w-full">Shorten URL</Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    Please log in with your Google account to use our URL shortening service.
                  </AlertDescription>
                </Alert>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={handleLogin}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                  Login with Google
                </Button>
              </div>
            )}
          </CardContent>
        </Card>}
        
      </main>
      <footer className="w-full mx-auto p-4 text-center text-sm text-gray-500">
        © 2023 সংক্ষিপ্ত. All rights reserved.
      </footer>
    </div>
  )
}