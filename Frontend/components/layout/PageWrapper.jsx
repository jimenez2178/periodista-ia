export default function PageWrapper({ children }) {
  return <div className="flex-1 overflow-y-auto px-8 py-8">{children}</div>;
}
