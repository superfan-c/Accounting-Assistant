import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 兼容调整文档中的 REACT_APP_ 前缀（Vite 默认仅暴露 VITE_）
  envPrefix: ['VITE_', 'REACT_APP_'],
})
