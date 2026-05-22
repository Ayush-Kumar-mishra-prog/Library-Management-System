import { BookOpenText } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function AuthShell({ title, subtitle, backgroundImage, children }) {
  return (
    <div className="min-h-screen p-3 sm:p-5">
      <div className="animate-fade-up mx-auto grid h-[calc(100vh-1.5rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-indigo-50/30 to-cyan-50/40 shadow-2xl dark:border-white/10 dark:bg-gradient-to-br dark:from-[#14001f] dark:via-[#1c1033] dark:to-[#24103f] sm:h-[calc(100vh-2.5rem)] lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <img src={backgroundImage} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/35 to-indigo-900/20" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.2em]">
              <BookOpenText className="h-4 w-4" />
              Library Management
            </p>
            <h2 className="text-3xl font-bold leading-tight">{title}</h2>
            <p className="mt-2 text-sm text-slate-100">{subtitle}</p>
          </div>
        </div>
        <div className="relative flex items-center justify-center bg-gradient-to-br from-white to-indigo-50/40 p-6 sm:p-10 dark:from-[#1a0b2e] dark:to-[#2a103f]">
          <div className="absolute right-4 top-4">
            <ThemeToggle />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
