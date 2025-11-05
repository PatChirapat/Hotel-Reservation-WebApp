export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888/hotel_api',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      }
    }
  }
}