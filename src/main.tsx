import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { AppRouter } from "@/router"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  </StrictMode>
)
