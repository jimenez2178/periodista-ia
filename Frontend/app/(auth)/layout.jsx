import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center gap-6 bg-brand-blue px-16 text-white">
        <Image src="/logo.png" alt="PeriodistaIA" width={72} height={72} className="rounded-brand" />
        <div>
          <h1 className="text-3xl font-bold">PeriodistaIA</h1>
          <p className="mt-2 text-lg text-brand-yellow">Tu copiloto editorial con IA</p>
        </div>
        <p className="max-w-sm text-white/80">
          El asistente que entiende el flujo de trabajo periodístico completo:
          desde la idea hasta la nota final.
        </p>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-brand-bg px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
