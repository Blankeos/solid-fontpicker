import vike from "vike/plugin"
import vikeSolid from "vike-solid/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [vike(), vikeSolid()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
})
