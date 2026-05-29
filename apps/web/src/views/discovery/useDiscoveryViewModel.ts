'use client';
import { useState, useCallback } from 'react';

export type DiscoveryProduct = {
  id: string;
  source: string;
  name: string;
  niche: string;
  hotScore: unknown;
  saturation: number;
  dossier: unknown;
};

export type ScanResult = { indexed: number; errors: string[] };

export function useDiscoveryViewModel(initialProducts: DiscoveryProduct[]) {
  const [products, setProducts] = useState(initialProducts);
  const [isScanning, setIsScanning] = useState(false);
  const [selected, setSelected] = useState<DiscoveryProduct | null>(null);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const scan = useCallback(async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/v1/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: ['youtube', 'meta'] }),
      });
      const data = await res.json() as ScanResult & { products?: string[] };
      setScanResult({ indexed: data.indexed ?? 0, errors: data.errors ?? [] });

      const refresh = await fetch('/api/v1/products?limit=50');
      const refreshData = await refresh.json() as { products: DiscoveryProduct[] };
      setProducts(refreshData.products ?? []);
    } catch (e) {
      setScanResult({ indexed: 0, errors: [e instanceof Error ? e.message : String(e)] });
    } finally {
      setIsScanning(false);
    }
  }, []);

  const niches = [...new Set(products.map(p => p.niche))].sort();

  const filtered = products.filter(p => {
    if (sourceFilter !== 'all' && p.source !== sourceFilter) return false;
    if (nicheFilter !== 'all' && p.niche !== nicheFilter) return false;
    return true;
  });

  return {
    products: filtered,
    totalCount: products.length,
    isScanning,
    selected,
    setSelected,
    sourceFilter,
    setSourceFilter,
    nicheFilter,
    setNicheFilter,
    scan,
    scanResult,
    niches,
  };
}
