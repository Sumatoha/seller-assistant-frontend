"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Search,
  TrendingDown,
  AlertTriangle,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type FilterType = "all" | "low-stock" | "dumping";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>(
    (searchParams.get("filter") as FilterType) || "all"
  );

  // Dumping modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDumpingModal, setShowDumpingModal] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [isDumpingLoading, setIsDumpingLoading] = useState(false);

  const fetchProducts = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const { products: data } = await api.getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply filter
    if (filter === "low-stock") {
      result = result.filter((p) => p.days_of_stock <= 7);
    } else if (filter === "dumping") {
      result = result.filter((p) => p.dumping_enabled);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      );
    }

    return result;
  }, [products, filter, searchQuery]);

  const handleEnableDumping = async () => {
    if (!selectedProduct || !minPrice) return;

    setIsDumpingLoading(true);
    try {
      const minPriceNum = parseFloat(minPrice);
      if (isNaN(minPriceNum) || minPriceNum <= 0) {
        return;
      }

      await api.enableDumping(selectedProduct.id, minPriceNum);
      await fetchProducts();
      setShowDumpingModal(false);
      setMinPrice("");
      setSelectedProduct(null);
    } catch (error) {
      console.error("Failed to enable dumping:", error);
    } finally {
      setIsDumpingLoading(false);
    }
  };

  const handleDisableDumping = async (productId: string) => {
    try {
      await api.disableDumping(productId);
      await fetchProducts();
    } catch (error) {
      console.error("Failed to disable dumping:", error);
    }
  };

  const openDumpingModal = (product: Product) => {
    setSelectedProduct(product);
    setMinPrice(product.min_price?.toString() || "");
    setShowDumpingModal(true);
  };

  const filterButtons: { label: string; value: FilterType; icon: React.ReactNode }[] = [
    { label: "All", value: "all", icon: <Package className="h-4 w-4" /> },
    { label: "Low Stock", value: "low-stock", icon: <AlertTriangle className="h-4 w-4" /> },
    { label: "Dumping", value: "dumping", icon: <TrendingDown className="h-4 w-4" /> },
  ];

  return (
    <>
      <Header
        title="Products"
        description={`${filteredProducts.length} products`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProducts(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter buttons */}
          <div className="flex gap-2">
            {filterButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={filter === btn.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(btn.value)}
              >
                {btn.icon}
                <span className="ml-2">{btn.label}</span>
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Products Table */}
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              searchQuery
                ? "Try adjusting your search query"
                : "Products will appear here once synced from Kaspi"
            }
          />
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate max-w-xs">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <code className="rounded bg-muted px-2 py-1 text-sm">
                          {product.sku}
                        </code>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">{formatCurrency(product.price)}</p>
                          {product.dumping_enabled && product.competitor_price && (
                            <p className="text-xs text-muted-foreground">
                              Competitor: {formatCurrency(product.competitor_price)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <Badge
                            variant={
                              product.stock <= 5
                                ? "destructive"
                                : product.days_of_stock <= 7
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {product.stock} units
                          </Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            ~{product.days_of_stock} days
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.dumping_enabled && (
                            <Badge variant="success" className="gap-1">
                              <TrendingDown className="h-3 w-3" />
                              Dumping
                            </Badge>
                          )}
                          {product.days_of_stock <= 7 && (
                            <Badge variant="warning" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {product.dumping_enabled ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisableDumping(product.id)}
                          >
                            Disable Dumping
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openDumpingModal(product)}
                          >
                            <TrendingDown className="mr-2 h-4 w-4" />
                            Enable Dumping
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enable Dumping Modal */}
      <Modal
        isOpen={showDumpingModal}
        onClose={() => {
          setShowDumpingModal(false);
          setSelectedProduct(null);
          setMinPrice("");
        }}
        title="Enable Price Dumping"
        description={`Set minimum price for ${selectedProduct?.name}`}
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Price</span>
              <span className="font-medium">
                {formatCurrency(selectedProduct?.price || 0)}
              </span>
            </div>
          </div>

          <Input
            label="Minimum Price (KZT)"
            type="number"
            placeholder="15000"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />

          <p className="text-sm text-muted-foreground">
            The system will automatically lower your price by 1 to beat competitors,
            but never below this minimum.
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDumpingModal(false);
                setSelectedProduct(null);
                setMinPrice("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnableDumping}
              isLoading={isDumpingLoading}
              disabled={!minPrice}
            >
              Enable Dumping
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
