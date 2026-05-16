import { ReactNode } from "react";

export default function EntetePage({
  titre,
  description,
  actions,
}: {
  titre: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{titre}</h1>
        {description && <p className="mt-1 text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
