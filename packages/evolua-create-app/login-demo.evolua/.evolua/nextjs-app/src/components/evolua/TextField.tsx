export function TextField({ label, type = 'text' }: { label: string; type?: 'text' | 'email' | 'password' }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-zinc-700">
      <span>{label}</span>
      <input type={type} placeholder={label} className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-zinc-900" />
    </label>
  );
}
