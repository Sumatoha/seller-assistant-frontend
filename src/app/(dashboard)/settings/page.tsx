"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Key,
  Globe,
  MessageSquare,
  TrendingDown,
  Trash2,
  Save,
  Check,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { KaspiKey } from "@/types";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [kaspiKey, setKaspiKey] = useState<KaspiKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Settings state
  const [autoReply, setAutoReply] = useState(user?.auto_reply_enabled || false);
  const [autoDumping, setAutoDumping] = useState(user?.auto_dumping_enabled || false);
  const [language, setLanguage] = useState<"ru" | "kk">(user?.language || "ru");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Kaspi key modal state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [newMerchantId, setNewMerchantId] = useState("");
  const [isKeyLoading, setIsKeyLoading] = useState(false);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchKaspiKey = async () => {
      try {
        const key = await api.getKaspiKey();
        setKaspiKey(key);
      } catch (error) {
        console.error("Failed to fetch Kaspi key:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKaspiKey();
  }, []);

  useEffect(() => {
    if (user) {
      setAutoReply(user.auto_reply_enabled);
      setAutoDumping(user.auto_dumping_enabled);
      setLanguage(user.language);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updatedUser = await api.updateSettings({
        auto_reply_enabled: autoReply,
        auto_dumping_enabled: autoDumping,
        language,
      });
      setUser(updatedUser);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveKaspiKey = async () => {
    if (!newApiKey || !newMerchantId) return;

    setIsKeyLoading(true);
    try {
      const key = await api.saveKaspiKey(newApiKey, newMerchantId);
      setKaspiKey(key);
      setShowKeyModal(false);
      setNewApiKey("");
      setNewMerchantId("");
    } catch (error) {
      console.error("Failed to save Kaspi key:", error);
    } finally {
      setIsKeyLoading(false);
    }
  };

  const handleDeleteKaspiKey = async () => {
    setIsDeleting(true);
    try {
      await api.deleteKaspiKey();
      setKaspiKey(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete Kaspi key:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasChanges =
    autoReply !== user?.auto_reply_enabled ||
    autoDumping !== user?.auto_dumping_enabled ||
    language !== user?.language;

  return (
    <>
      <Header title="Settings" description="Manage your account and preferences" />

      <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
        {/* Kaspi API Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Kaspi API Key
            </CardTitle>
            <CardDescription>
              Connect your Kaspi marketplace account to sync products and reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kaspiKey ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Merchant ID:</span>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {kaspiKey.merchant_id}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={kaspiKey.is_active ? "success" : "secondary"}>
                        {kaspiKey.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Added on {new Date(kaspiKey.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No API key configured</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your Kaspi API key to start syncing your products
                </p>
                <Button className="mt-4" onClick={() => setShowKeyModal(true)}>
                  <Key className="mr-2 h-4 w-4" />
                  Add API Key
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Automation
            </CardTitle>
            <CardDescription>Configure automatic features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Auto-Reply to Reviews</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically generate AI responses for new reviews
                </p>
              </div>
              <Switch checked={autoReply} onCheckedChange={setAutoReply} />
            </div>

            <div className="border-t border-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Auto Price Dumping</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable automatic price matching for all products with dumping enabled
                </p>
              </div>
              <Switch checked={autoDumping} onCheckedChange={setAutoDumping} />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language
            </CardTitle>
            <CardDescription>Choose your preferred language for AI responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={language === "ru" ? "default" : "outline"}
                onClick={() => setLanguage("ru")}
              >
                Русский
              </Button>
              <Button
                variant={language === "kk" ? "default" : "outline"}
                onClick={() => setLanguage("kk")}
              >
                Қазақша
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        {hasChanges && (
          <div className="sticky bottom-4 flex justify-end">
            <Button onClick={handleSaveSettings} isLoading={isSaving} size="lg">
              {saveSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Add Kaspi Key Modal */}
      <Modal
        isOpen={showKeyModal}
        onClose={() => {
          setShowKeyModal(false);
          setNewApiKey("");
          setNewMerchantId("");
        }}
        title="Add Kaspi API Key"
        description="Enter your Kaspi marketplace credentials"
      >
        <div className="space-y-4">
          <Input
            label="API Key"
            type="password"
            placeholder="Enter your Kaspi API key"
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
          />

          <Input
            label="Merchant ID"
            placeholder="Enter your Merchant ID"
            value={newMerchantId}
            onChange={(e) => setNewMerchantId(e.target.value)}
          />

          <p className="text-sm text-muted-foreground">
            You can find these credentials in your Kaspi Merchant Cabinet.
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowKeyModal(false);
                setNewApiKey("");
                setNewMerchantId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveKaspiKey}
              isLoading={isKeyLoading}
              disabled={!newApiKey || !newMerchantId}
            >
              Save Key
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove API Key"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm">
              This will remove your Kaspi API key. You won&apos;t be able to sync products
              or reviews until you add a new key.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteKaspiKey}
              isLoading={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Key
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
