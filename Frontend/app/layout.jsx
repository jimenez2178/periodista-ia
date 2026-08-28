import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import ServiceWorkerCleanup from "../components/ServiceWorkerCleanup";

export const metadata = {
  title: "PeriodistaIA",
  description: "Tu copiloto editorial con IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ServiceWorkerCleanup />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
