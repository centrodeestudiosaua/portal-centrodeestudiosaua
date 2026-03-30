export function LibraryPromoCard() {
  return (
    <section className="relative overflow-hidden rounded-none bg-primary p-8 text-white">
      <div className="relative z-10">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
          Exclusivo Alumnos
        </p>
        <h3 className="mb-4 text-3xl font-bold leading-tight">
          Bibliotecas Digitales AUA
        </h3>
        <p className="mb-6 max-w-xs text-sm text-white/70">
          Accede a mas de 5,000 tomos juridicos y jurisprudencia actualizada sin
          costo adicional.
        </p>
        <button
          type="button"
          className="border border-accent px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-primary"
        >
          Solicitar Acceso
        </button>
      </div>

      <div className="absolute bottom-0 right-0 text-[140px] font-bold leading-none text-white/5">
        AUA
      </div>
    </section>
  );
}
