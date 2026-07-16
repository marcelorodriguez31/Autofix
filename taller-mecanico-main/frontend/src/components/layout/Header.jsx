import { useAuth } from '../../context/AuthContext';

export default function Header({ title }) {
  const { user } = useAuth();
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold uppercase">
            {user?.empresa?.[0] ?? 'E'}
          </span>
        </div>
        <span className="text-sm text-slate-600 hidden sm:block">
            {user?.empresa}
          </span>
      </div>
    </header>
  );
}
