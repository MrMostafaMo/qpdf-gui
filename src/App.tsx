import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { useTheme, useSettingsStore } from "@/hooks"
import { useEffect } from "react"
import { AppLayout } from "@/components/layout"

import DashboardPage from "@/features/dashboard/DashboardPage"
import ExtractPage from "@/features/extract/ExtractPage"
import MergePage from "@/features/merge/MergePage"
import SplitPage from "@/features/split/SplitPage"
import RotatePage from "@/features/rotate/RotatePage"
import DeletePage from "@/features/delete/DeletePage"
import EncryptPage from "@/features/encrypt/EncryptPage"
import DecryptPage from "@/features/decrypt/DecryptPage"
import OptimizePage from "@/features/optimize/OptimizePage"
import LinearizePage from "@/features/linearize/LinearizePage"
import InfoPage from "@/features/info/InfoPage"
import BatchPage from "@/features/batch/BatchPage"
import SettingsPage from "@/features/settings/SettingsPage"

export default function App() {
  useTheme()
  const loadSettings = useSettingsStore((s) => s.loadSettings)

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/extract" element={<ExtractPage />} />
          <Route path="/merge" element={<MergePage />} />
          <Route path="/split" element={<SplitPage />} />
          <Route path="/rotate" element={<RotatePage />} />
          <Route path="/delete" element={<DeletePage />} />
          <Route path="/encrypt" element={<EncryptPage />} />
          <Route path="/decrypt" element={<DecryptPage />} />
          <Route path="/optimize" element={<OptimizePage />} />
          <Route path="/linearize" element={<LinearizePage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/batch" element={<BatchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
