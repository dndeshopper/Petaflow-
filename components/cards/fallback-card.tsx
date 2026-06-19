export function FallbackCard({
  platform,
  title,
  note,
}: {
  platform: string;
  title: string;
  note?: string | null;
}) {
  return (
    <div className="flex aspect-[16/9] flex-col justify-between rounded-xl border border-border bg-[#FAFAF8] p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {platform}
        </p>
        <h4 className="mt-3 font-serif text-lg leading-snug text-foreground line-clamp-3">
          {title}
        </h4>
      </div>
      {note && (
        <p className="text-[13px] text-muted-foreground line-clamp-2">{note}</p>
      )}
      <p className="text-[10px] text-muted-foreground/60">Preview unavailable</p>
    </div>
  );
}
