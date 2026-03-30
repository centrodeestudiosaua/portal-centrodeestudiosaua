export default function LessonLoading() {
  return (
    <div className="space-y-8">
      <section className="portal-card min-h-[220px] animate-pulse bg-muted/40" />
      <section className="portal-card min-h-[320px] animate-pulse bg-muted/40" />
      <section className="grid gap-4 md:grid-cols-2">
        <div className="portal-card min-h-[140px] animate-pulse bg-muted/40" />
        <div className="portal-card min-h-[140px] animate-pulse bg-muted/40" />
      </section>
    </div>
  );
}
