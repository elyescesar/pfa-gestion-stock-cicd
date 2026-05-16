import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ArrowLeftRight,
  AlertTriangle,
  LogOut,
  Boxes,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexte/AuthContext";
import Badge from "./ui/Badge";

const liens = [
  { to: "/", fin: true, label: "Tableau de bord", icone: LayoutDashboard },
  { to: "/produits", label: "Produits", icone: Package },
  { to: "/categories", label: "Catégories", icone: FolderOpen },
  { to: "/mouvements", label: "Mouvements", icone: ArrowLeftRight },
  { to: "/alertes", label: "Alertes stock", icone: AlertTriangle },
];

function BarreLaterale({
  onNaviguer,
  className = "",
}: {
  onNaviguer?: () => void;
  className?: string;
}) {
  const { utilisateur, deconnexion } = useAuth();

  return (
    <aside className={`flex h-full w-64 flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl ${className}`}>
      <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/30">
          <Boxes className="h-5 w-5 text-slate-950" />
        </div>
        <div>
          <span className="font-bold text-white tracking-tight">StockFlow</span>
          <span className="block text-[10px] uppercase tracking-widest text-slate-500">
            Gestion de stock
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {liens.map(({ to, fin, label, icone: Icone }) => (
          <NavLink
            key={to}
            to={to}
            end={fin}
            onClick={onNaviguer}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-300 shadow-inner"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`
            }
          >
            <Icone className="h-5 w-5 shrink-0 opacity-80" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800/80 p-4">
        <div className="mb-3 rounded-xl bg-slate-900/50 p-3">
          <p className="truncate text-sm font-medium text-slate-200">{utilisateur?.email}</p>
          <Badge variante="info">
            {utilisateur?.role === "admin" ? "Administrateur" : "Opérateur"}
          </Badge>
        </div>
        <button
          type="button"
          onClick={() => {
            deconnexion();
            onNaviguer?.();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/50 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default function Layout() {
  const location = useLocation();
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40">
        <BarreLaterale />
      </div>

      {menuOuvert && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOuvert(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 animate-slide-in">
            <BarreLaterale onNaviguer={() => setMenuOuvert(false)} />
          </div>
        </div>
      )}

      <header className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center gap-3 border-b border-slate-800/80 bg-slate-950/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOuvert(true)}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Menu"
        >
          {menuOuvert ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="font-semibold text-white">StockFlow</span>
      </header>

      <main className="flex-1 p-4 pt-16 lg:ml-64 lg:p-8 lg:pt-8">
        <div key={location.pathname} className="animate-fade-in mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
