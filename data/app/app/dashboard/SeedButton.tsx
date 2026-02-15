"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SeedButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      router.refresh(); // Recarrega os dados da página
    } catch (error) {
      console.error("Erro ao popular:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="mt-4 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span> Populando...
        </>
      ) : (
        <>
          <span>🍿</span> Popular Banco com Clássicos
        </>
      )}
    </button>
  );
}
