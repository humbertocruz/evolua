'use client';

import { useState, useEffect, use } from 'react';
import { 
  Building2, 
  MapPin, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

// PADRÃO ANTIGO: params era um objeto direto
export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
      const { id } = use(params);
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/instituicoes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setInstitution(data);
        }
      } catch (err) {
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="p-8">
      <h1>Ficha da Instituição {id}</h1>
      {institution && <p>{institution.nomeFantasia}</p>}
    </div>
  );
}
