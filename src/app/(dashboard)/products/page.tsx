"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Search, TrendingDown, AlertTriangle, X } from "lucide-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type FilterType = "all" | "low-stock" | "dumping";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>(
    (searchParams.get("filter") as FilterType) || "all"
  );

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const { products: data } = await api.getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (filter === "low-stock") result = result.filter((p) => p.days_of_stock <= 7);
    else if (filter === "dumping") result = result.filter((p) => p.dumping_enabled);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return result;
  }, [products, filter, searchQuery]);

  const handleEnableDumping = async () => {
    if (!selectedProduct || !minPrice) return;
    setIsSubmitting(true);
    try {
      await api.enableDumping(selectedProduct.id, parseFloat(minPrice));
      await fetchProducts();
      setShowModal(false);
      setSelectedProduct(null);
      setMinPrice("");
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisableDumping = async (id: string) => {
    try {
      await api.disableDumping(id);
      await fetchProducts();
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: "Все", value: "all" },
    { label: "Мало на складе", value: "low-stock" },
    { label: "Демпинг", value: "dumping" },
  ];

  return (
    <>
      <Header title="Товары" description={`${filteredProducts.length} товаров`} />

      <div className="p-4 lg:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium",
                  filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Товары не найдены</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Товар</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">SKU</th>
                  <th className="px-4 py-3 text-left font-medium">Цена</th>
                  <th className="px-4 py-3 text-left font-medium">Остаток</th>
                  <th className="px-4 py-3 text-right font-medium">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium truncate max-w-[200px]">{p.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.sku}</code>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{formatCurrency(p.price)}</p>
                      {p.dumping_enabled && (
                        <p className="text-xs text-muted-foreground">мин: {formatCurrency(p.min_price || 0)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.stock <= 5 ? "destructive" : p.days_of_stock <= 7 ? "warning" : "secondary"}>
                        {p.stock} шт
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.dumping_enabled ? (
                        <Button variant="ghost" size="sm" onClick={() => handleDisableDumping(p.id)}>
                          Выкл
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(p);
                            setMinPrice(p.min_price?.toString() || "");
                            setShowModal(true);
                          }}
                        >
                          <TrendingDown className="h-4 w-4 mr-1" />
                          Демпинг
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedProduct(null);
          setMinPrice("");
        }}
        title="Включить демпинг"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm">{selectedProduct?.name}</p>
            <p className="text-xs text-muted-foreground">Текущая цена: {formatCurrency(selectedProduct?.price || 0)}</p>
          </div>
          <Input
            label="Минимальная цена (₸)"
            type="number"
            placeholder="15000"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Цена автоматически будет снижаться на 1₸ ниже конкурента, но не ниже минимальной.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleEnableDumping} isLoading={isSubmitting} disabled={!minPrice}>
              Включить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
