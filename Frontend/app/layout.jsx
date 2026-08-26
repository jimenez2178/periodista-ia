import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "PeriodistaIA",
  description: "Tu copiloto editorial con IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
