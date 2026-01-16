"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Star, Search, X, Sparkles, Copy, Check, Edit3 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

type FilterType = "all" | "pending" | "replied";

export default function ReviewsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>(
    (searchParams.get("filter") as FilterType) || "all"
  );

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const { reviews: data } = await api.getReviews(100);
      setReviews(data || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    let result = reviews;
    if (filter === "pending") result = result.filter((r) => !r.ai_response);
    else if (filter === "replied") result = result.filter((r) => r.ai_response);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) => r.text.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.product_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [reviews, filter, searchQuery]);

  const handleGenerate = async () => {
    if (!selectedReview) return;
    setIsGenerating(true);
    try {
      const { ai_response } = await api.generateAiReply(selectedReview.id, user?.language_code || "ru");
      setReplyText(ai_response);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedReview || !replyText) return;
    setIsSaving(true);
    try {
      await api.updateReply(selectedReview.id, replyText);
      await fetchReviews();
      setShowModal(false);
      setSelectedReview(null);
      setReplyText("");
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3 w-3 ${s <= rating ? "fill-warning text-warning" : "text-muted"}`} />
      ))}
    </div>
  );

  const filters: { label: string; value: FilterType; count: number }[] = [
    { label: "Все", value: "all", count: reviews.length },
    { label: "Без ответа", value: "pending", count: reviews.filter((r) => !r.ai_response).length },
    { label: "С ответом", value: "replied", count: reviews.filter((r) => r.ai_response).length },
  ];

  return (
    <>
      <Header title="Отзывы" description={`${filteredReviews.length} отзывов`} />

      <div className="p-4 lg:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium flex items-center gap-2",
                  filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
                <span className={cn("text-xs", filter === f.value ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {f.count}
                </span>
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

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Star className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Отзывы не найдены</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {renderStars(r.rating)}
                      <Badge variant={r.ai_response ? "success" : "secondary"} className="text-[10px]">
                        {r.ai_response ? "Ответили" : "Новый"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(r.created_at)}</span>
                    </div>
                    <p className="text-sm">{r.text}</p>
                    <p className="text-xs text-muted-foreground">{r.author} · {r.product_name}</p>

                    {r.ai_response && (
                      <div className="mt-3 rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> AI ответ
                        </p>
                        <p className="text-sm">{r.ai_response}</p>
                        <div className="mt-2 flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => copy(r.ai_response!, r.id)}>
                            {copiedId === r.id ? <Check className="h-3 w-3 mr-1 text-success" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copiedId === r.id ? "Скопировано" : "Копировать"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReview(r);
                              setReplyText(r.ai_response || "");
                              setShowModal(true);
                            }}
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Изменить
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!r.ai_response && (
                    <Button
                      onClick={() => {
                        setSelectedReview(r);
                        setReplyText("");
                        setShowModal(true);
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Ответить
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedReview(null);
          setReplyText("");
        }}
        title="Ответ на отзыв"
        className="max-w-xl"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2 mb-1">
                {renderStars(selectedReview.rating)}
                <span className="text-xs text-muted-foreground">{selectedReview.author}</span>
              </div>
              <p className="text-sm">{selectedReview.text}</p>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Ответ</label>
              <Button variant="ghost" size="sm" onClick={handleGenerate} isLoading={isGenerating}>
                <Sparkles className="h-4 w-4 mr-1" />
                Сгенерировать
              </Button>
            </div>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Напишите ответ..."
              className="min-h-[120px]"
            />

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Отмена
              </Button>
              <Button onClick={handleSave} isLoading={isSaving} disabled={!replyText}>
                Сохранить
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
