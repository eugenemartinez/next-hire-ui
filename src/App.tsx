import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner' // Import Sonner's Toaster
import MainLayout from './components/layout/MainLayout'
import ModalProvider from './components/providers/ModalProvider' // Import the ModalProvider component

// Import actual page components
import HomePage from './pages/HomePage'
import JobsPage from './pages/JobsPage'
import JobDetailsPage from './pages/JobDetailsPage'
import AddJobPage from './pages/AddJobPage'
import EditJobPage from './pages/EditJobPage'
import SavedJobsPage from './pages/SavedJobsPage'

// 404 page
const NotFoundPage = () => (
  <div className="py-12 text-center">
    <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" className="text-primary hover:underline">Back to Home</a>
  </div>
)

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:jobId" element={<JobDetailsPage />} />
            <Route path="jobs/add" element={<AddJobPage />} />
            <Route path="jobs/:jobId/edit" element={<EditJobPage />} />
            <Route path="saved-jobs" element={<SavedJobsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        
        {/* Move ModalProvider INSIDE the Router component */}
        <ModalProvider />
      </Router>
      
      {/* Add Sonner Toaster component - can stay outside Router */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          duration: 3000, // 3 seconds
        }}
      />
    </>
  )
}

export default App


