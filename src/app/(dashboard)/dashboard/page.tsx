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
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatRelativeTime, truncateText } from "@/lib/utils";
import type { DashboardStats, DashboardOverview, Product, Review } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-warning text-warning" : "text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Header
        title="Dashboard"
        description="Overview of your Kaspi store"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Total Products"
                value={stats?.total_products || 0}
                icon={Package}
              />
              <StatCard
                title="Low Stock"
                value={stats?.low_stock_count || 0}
                icon={AlertTriangle}
                className={stats?.low_stock_count ? "border-warning" : ""}
              />
              <StatCard
                title="Dumping Active"
                value={stats?.dumping_enabled_count || 0}
                icon={TrendingDown}
              />
              <StatCard
                title="Total Reviews"
                value={stats?.total_reviews || 0}
                icon={Star}
              />
              <StatCard
                title="Pending Replies"
                value={stats?.pending_replies || 0}
                icon={MessageSquare}
                className={stats?.pending_replies ? "border-primary" : ""}
              />
              <StatCard
                title="Inventory Value"
                value={formatCurrency(stats?.total_inventory_value || 0)}
                icon={DollarSign}
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Low Stock Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Low Stock Alert
              </CardTitle>
              <Link href="/products?filter=low-stock">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={3} />
              ) : overview?.low_stock && overview.low_stock.length > 0 ? (
                <div className="space-y-3">
                  {overview.low_stock.slice(0, 5).map((product: Product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <Badge variant={product.stock <= 5 ? "destructive" : "warning"}>
                          {product.stock} left
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          ~{product.days_of_stock} days
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Package}
                  title="All stocked up!"
                  description="No products are running low on stock"
                />
              )}
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Pending Reviews
              </CardTitle>
              <Link href="/reviews?filter=pending">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={3} />
              ) : overview?.pending_reviews && overview.pending_reviews.length > 0 ? (
                <div className="space-y-3">
                  {overview.pending_reviews.slice(0, 5).map((review: Review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {renderStarRating(review.rating)}
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(review.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm">
                            {truncateText(review.text, 100)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {review.product_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="All caught up!"
                  description="No reviews waiting for a response"
                />
              )}
            </CardContent>
          </Card>

          {/* Active Price Dumping */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-success" />
                Price Dumping Active
              </CardTitle>
              <Link href="/products?filter=dumping">
                <Button variant="ghost" size="sm">
                  Manage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={3} />
              ) : overview?.dumping_products && overview.dumping_products.length > 0 ? (
                <div className="space-y-3">
                  {overview.dumping_products.slice(0, 5).map((product: Product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Min: {formatCurrency(product.min_price || 0)}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-success">
                          {formatCurrency(product.price)}
                        </p>
                        {product.competitor_price && (
                          <p className="text-xs text-muted-foreground">
                            vs {formatCurrency(product.competitor_price)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={TrendingDown}
                  title="No active dumping"
                  description="Enable price dumping on products to stay competitive"
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Recent Reviews
              </CardTitle>
              <Link href="/reviews">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={3} />
              ) : overview?.recent_reviews && overview.recent_reviews.length > 0 ? (
                <div className="space-y-3">
                  {overview.recent_reviews.slice(0, 5).map((review: Review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {renderStarRating(review.rating)}
                            <Badge variant={review.replied ? "success" : "secondary"} className="text-xs">
                              {review.replied ? "Replied" : "New"}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm">
                            {truncateText(review.text, 80)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            by {review.author} · {formatRelativeTime(review.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Star}
                  title="No reviews yet"
                  description="Reviews will appear here once customers leave feedback"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
