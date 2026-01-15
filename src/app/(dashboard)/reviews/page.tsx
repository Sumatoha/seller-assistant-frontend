"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Star,
  Search,
  Filter,
  X,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Check,
  Edit3,
  Copy,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRelativeTime, truncateText } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

type FilterType = "all" | "pending" | "replied";

export default function ReviewsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>(
    (searchParams.get("filter") as FilterType) || "all"
  );

  // Reply modal state
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchReviews = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const { reviews: data } = await api.getReviews(100);
      setReviews(data || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    let result = reviews;

    // Apply filter
    if (filter === "pending") {
      result = result.filter((r) => !r.ai_response);
    } else if (filter === "replied") {
      result = result.filter((r) => r.ai_response);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.text.toLowerCase().includes(query) ||
          r.author.toLowerCase().includes(query) ||
          r.product_name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [reviews, filter, searchQuery]);

  const handleGenerateReply = async () => {
    if (!selectedReview) return;

    setIsGenerating(true);
    try {
      const { ai_response } = await api.generateAiReply(
        selectedReview.id,
        user?.language || "ru"
      );
      setReplyText(ai_response);
    } catch (error) {
      console.error("Failed to generate reply:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReply = async () => {
    if (!selectedReview || !replyText) return;

    setIsSaving(true);
    try {
      await api.updateReply(selectedReview.id, replyText);
      await fetchReviews();
      setShowReplyModal(false);
      setSelectedReview(null);
      setReplyText("");
    } catch (error) {
      console.error("Failed to save reply:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const openReplyModal = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.ai_response || "");
    setShowReplyModal(true);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const filterButtons: { label: string; value: FilterType; count?: number }[] = [
    { label: "All", value: "all", count: reviews.length },
    { label: "Pending", value: "pending", count: reviews.filter((r) => !r.ai_response).length },
    { label: "Replied", value: "replied", count: reviews.filter((r) => r.ai_response).length },
  ];

  return (
    <>
      <Header
        title="Reviews"
        description={`${filteredReviews.length} reviews`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReviews(true)}
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
                {btn.label}
                {btn.count !== undefined && (
                  <span className={cn(
                    "ml-2 rounded-full px-2 py-0.5 text-xs",
                    filter === btn.value ? "bg-white/20" : "bg-muted"
                  )}>
                    {btn.count}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews..."
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

        {/* Reviews List */}
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : filteredReviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews found"
            description={
              searchQuery
                ? "Try adjusting your search query"
                : "Reviews will appear here once customers leave feedback"
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-border bg-card p-4 lg:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Review Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderStarRating(review.rating)}
                      <Badge variant={review.ai_response ? "success" : "secondary"}>
                        {review.ai_response ? "Replied" : "Pending"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(review.created_at)}
                      </span>
                    </div>

                    <p className="text-foreground">{review.text}</p>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{review.author}</span>
                      <span>·</span>
                      <span>{review.product_name}</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        {review.product_sku}
                      </span>
                    </div>

                    {/* AI Response */}
                    {review.ai_response && (
                      <div className="mt-4 rounded-lg bg-muted/50 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                          <Sparkles className="h-4 w-4" />
                          AI Generated Response
                        </div>
                        <p className="text-sm">{review.ai_response}</p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(review.ai_response!, review.id)}
                          >
                            {copiedId === review.id ? (
                              <Check className="mr-2 h-4 w-4 text-success" />
                            ) : (
                              <Copy className="mr-2 h-4 w-4" />
                            )}
                            {copiedId === review.id ? "Copied!" : "Copy"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReplyModal(review)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 lg:flex-col">
                    {!review.ai_response ? (
                      <Button onClick={() => openReplyModal(review)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Reply
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => openReplyModal(review)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Reply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setSelectedReview(null);
          setReplyText("");
        }}
        title="Reply to Review"
        className="max-w-2xl"
      >
        {selectedReview && (
          <div className="space-y-4">
            {/* Original Review */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                {renderStarRating(selectedReview.rating)}
                <span className="text-sm text-muted-foreground">
                  by {selectedReview.author}
                </span>
              </div>
              <p className="text-sm">{selectedReview.text}</p>
            </div>

            {/* Reply Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Your Reply</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateReply}
                  isLoading={isGenerating}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </Button>
              </div>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                className="min-h-[150px]"
              />
            </div>

            {/* Language Note */}
            <p className="text-xs text-muted-foreground">
              AI will generate response in {user?.language === "kk" ? "Kazakh" : "Russian"}.
              Change this in Settings.
            </p>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedReview(null);
                  setReplyText("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveReply}
                isLoading={isSaving}
                disabled={!replyText}
              >
                <Check className="mr-2 h-4 w-4" />
                Save Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
