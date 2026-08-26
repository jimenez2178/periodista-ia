export default function PageWrapper({ children }) {
  return <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">{children}</div>;
}
