import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import path from 'path';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
//   resolve: {
//         alias: [
//             // 将 "@" 映射到项目的 src 目录
//             { find: '@', replacement: path.join(__dirname, 'src') },
//         ],
//     },
})
