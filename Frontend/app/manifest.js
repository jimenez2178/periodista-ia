export default function manifest() {
  return {
    name: "PeriodistaIA",
    short_name: "PeriodistaIA",
    description: "Tu copiloto editorial con IA",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9fa",
    theme_color: "#1b2b4b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
