import { useState } from 'react'
import { useStore } from './stores/useStore'
import SetupWizard from './components/SetupWizard'
import StoryReader from './components/StoryReader'
import SessionManager from './components/SessionManager'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const hasCompletedSetup = useStore(s => s.settings.hasCompletedSetup)
  const currentSessionId = useStore(s => s.currentSessionId)
  const [showWizard, setShowWizard] = useState(false)

  // 有设置且有活跃会话 → 直接进入故事阅读
  if (hasCompletedSetup && currentSessionId) {
    return (
      <ErrorBoundary>
        <StoryReader />
      </ErrorBoundary>
    )
  }

  // 有设置但无会话 → 显示会话管理或设置向导
  if (hasCompletedSetup && !currentSessionId) {
    if (showWizard) {
      return (
        <ErrorBoundary>
          <SetupWizard />
        </ErrorBoundary>
      )
    }
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="text-indigo-400">A</span>
                <span className="text-amber-400">+1</span>
                <span className="text-white"> 快</span>
              </h1>
              <p className="text-slate-400">欢迎回来！选择一个故事继续</p>
            </div>
            <SessionManager onClose={() => {}} />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowWizard(true)}
                className="text-slate-600 hover:text-slate-400 text-sm underline transition-colors"
              >
                或重新进行初始设置 →
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  // 首次使用 → 设置向导
  return (
    <ErrorBoundary>
      <SetupWizard />
    </ErrorBoundary>
  )
}
