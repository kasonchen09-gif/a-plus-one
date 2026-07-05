import { useStore } from './stores/useStore'
import SetupWizard from './components/SetupWizard'
import StoryReader from './components/StoryReader'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const hasCompletedSetup = useStore(s => s.settings.hasCompletedSetup)

  return (
    <ErrorBoundary>
      {hasCompletedSetup ? <StoryReader /> : <SetupWizard />}
    </ErrorBoundary>
  )
}
