import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { AppRouter } from "@/router"
import { AuthProvider } from "@/contexts/auth"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-center" duration={5000} richColors />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
