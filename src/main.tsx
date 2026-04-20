import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { AppRouter } from "@/router"
import { AuthProvider } from "@/contexts/auth"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
