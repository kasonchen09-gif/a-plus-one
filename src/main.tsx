import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 预加载 Web Speech API 语音列表
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices()
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
