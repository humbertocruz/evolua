"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que quer apagar esse filme?")) return;
    
    setDeleting(true);
    await fetch(`/api/movies/${id}`, { method: "DELETE" });
    router.refresh();
    setDeleting(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="absolute bottom-4 right-4 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      title="Apagar Filme"
    >
      {deleting ? "⏳" : "🗑️"}
    </button>
  );
}
