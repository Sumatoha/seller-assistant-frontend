"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Star,
  MessageSquare,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { StatCardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { DashboardStats, DashboardOverview, Product, Review } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, overviewData] = await Promise.all([
          api.getDashboardStats(),
          api.getDashboardOverview(),
        ]);
        setStats(statsData);
        setOverview(overviewData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${s <= rating ? "fill-warning text-warning" : "text-muted"}`}
        />
      ))}
    </div>
  );

  return (
    <>
      <Header title="Главная" />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard title="Товаров" value={stats?.total_products || 0} icon={Package} />
              <StatCard title="Мало на складе" value={stats?.low_stock_count || 0} icon={AlertTriangle} />
              <StatCard title="Демпинг" value={stats?.dumping_enabled_count || 0} icon={TrendingDown} />
              <StatCard title="Отзывов" value={stats?.total_reviews || 0} icon={Star} />
              <StatCard title="Без ответа" value={stats?.pending_replies || 0} icon={MessageSquare} />
              <StatCard title="На складе" value={formatCurrency(stats?.total_inventory_value || 0)} icon={DollarSign} />
            </>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Low Stock */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium">Мало на складе</h2>
              <Link href="/products?filter=low-stock" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                Все <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))
              ) : overview?.low_stock?.length ? (
                overview.low_stock.slice(0, 5).map((p: Product) => (
                  <div key={p.id} className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku}</p>
                    </div>
                    <Badge variant={p.stock <= 5 ? "destructive" : "warning"} className="ml-3">
                      {p.stock} шт
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground text-center">Все в порядке</p>
              )}
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium">Ожидают ответа</h2>
              <Link href="/reviews?filter=pending" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                Все <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))
              ) : overview?.pending_reviews?.length ? (
                overview.pending_reviews.slice(0, 5).map((r: Review) => (
                  <div key={r.id} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(r.rating)}
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(r.created_at)}</span>
                    </div>
                    <p className="text-sm line-clamp-2">{r.text}</p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground text-center">Нет новых отзывов</p>
              )}
            </div>
          </div>

          {/* Active Dumping */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium">Активный демпинг</h2>
              <Link href="/products?filter=dumping" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                Все <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))
              ) : overview?.dumping_products?.length ? (
                overview.dumping_products.slice(0, 5).map((p: Product) => (
                  <div key={p.id} className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">мин: {formatCurrency(p.min_price || 0)}</p>
                    </div>
                    <p className="text-sm font-medium text-success ml-3">{formatCurrency(p.price)}</p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground text-center">Демпинг не активен</p>
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium">Последние отзывы</h2>
              <Link href="/reviews" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                Все <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))
              ) : overview?.recent_reviews?.length ? (
                overview.recent_reviews.slice(0, 5).map((r: Review) => (
                  <div key={r.id} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(r.rating)}
                      <Badge variant={r.ai_response ? "success" : "secondary"} className="text-[10px]">
                        {r.ai_response ? "Ответили" : "Новый"}
                      </Badge>
                    </div>
                    <p className="text-sm line-clamp-2">{r.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.author}</p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground text-center">Нет отзывов</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
