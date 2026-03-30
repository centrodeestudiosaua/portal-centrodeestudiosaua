export default function CourseDetailLoading() {
  return (
    <div className="space-y-8">
      <section className="portal-card min-h-[320px] animate-pulse bg-muted/40" />
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="portal-card min-h-[420px] animate-pulse bg-muted/40" />
        <aside className="space-y-8">
          <section className="portal-card min-h-[240px] animate-pulse bg-muted/40" />
          <section className="portal-card min-h-[240px] animate-pulse bg-muted/40" />
        </aside>
      </div>
    </div>
  );
}
