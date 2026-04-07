import { Settings } from "lucide-react";

export default function AdminAjustesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ajustes</h1>
          <p className="text-sm text-slate-500">Configuración de la plataforma</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Settings className="h-10 w-10 text-slate-300 mx-auto mb-4 animate-[spin_4s_linear_infinite]" />
        <h3 className="text-lg font-bold text-slate-700">Módulo en construcción</h3>
        <p className="text-slate-500 text-sm mt-2">Aquí podrás configurar variables del sistema y gestionar usuarios administrativos.</p>
      </div>
    </div>
  );
}
