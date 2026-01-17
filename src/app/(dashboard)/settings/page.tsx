"use client";

import { useEffect, useState } from "react";
import { Key, Globe, MessageSquare, Trash2, Save, Check, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { KaspiKey } from "@/types";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [kaspiKey, setKaspiKey] = useState<KaspiKey | null>(null);

  const [autoReply, setAutoReply] = useState(user?.auto_reply_enabled || false);
  const [autoDumping, setAutoDumping] = useState(user?.auto_dumping_enabled || false);
  const [language, setLanguage] = useState<"ru" | "kk">(user?.language_code || "ru");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [newMerchantId, setNewMerchantId] = useState("");
  const [isKeyLoading, setIsKeyLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const key = await api.getKaspiKey();
        setKaspiKey(key);
      } catch {
        // ignore
      }
    };
    fetchKey();
  }, []);

  useEffect(() => {
    if (user) {
      setAutoReply(user.auto_reply_enabled);
      setAutoDumping(user.auto_dumping_enabled);
      setLanguage(user.language_code);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const updated = await api.updateSettings({
        auto_reply_enabled: autoReply,
        auto_dumping_enabled: autoDumping,
        language_code: language,
      });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveKey = async () => {
    if (!newApiKey || !newMerchantId) return;
    setIsKeyLoading(true);
    try {
      const key = await api.saveKaspiKey(newApiKey, newMerchantId);
      setKaspiKey(key);
      setShowKeyModal(false);
      setNewApiKey("");
      setNewMerchantId("");
    } catch {
      // ignore
    } finally {
      setIsKeyLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    setIsDeleting(true);
    try {
      await api.deleteKaspiKey();
      setKaspiKey(null);
      setShowDeleteModal(false);
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await api.syncKaspiNow();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (error: any) {
      console.error("Sync error:", error);
      alert(error.response?.data?.error || "Ошибка синхронизации");
    } finally {
      setIsSyncing(false);
    }
  };

  const hasChanges =
    autoReply !== user?.auto_reply_enabled ||
    autoDumping !== user?.auto_dumping_enabled ||
    language !== user?.language_code;

  return (
    <>
      <Header title="Настройки" />

      <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
        {/* API Key */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Key className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Kaspi API</h2>
          </div>
          <div className="p-4">
            {kaspiKey ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-0.5 rounded">{kaspiKey.merchant_id}</code>
                      <Badge variant={kaspiKey.is_active ? "success" : "secondary"}>
                        {kaspiKey.is_active ? "Активен" : "Неактивен"}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSync}
                    isLoading={isSyncing}
                    variant="secondary"
                    className="w-full"
                  >
                    {syncSuccess ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Синхронизировано
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Синхронизировать сейчас
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">API ключ не настроен</p>
                <Button onClick={() => setShowKeyModal(true)}>
                  <Key className="h-4 w-4 mr-2" />
                  Добавить ключ
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Automation */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Автоматизация</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">Авто-ответы на отзывы</p>
                <p className="text-xs text-muted-foreground">AI будет автоматически отвечать на новые отзывы</p>
              </div>
              <Switch checked={autoReply} onCheckedChange={setAutoReply} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">Авто-демпинг</p>
                <p className="text-xs text-muted-foreground">Автоматически следить за ценами конкурентов</p>
              </div>
              <Switch checked={autoDumping} onCheckedChange={setAutoDumping} />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Язык AI ответов</h2>
          </div>
          <div className="p-4 flex gap-2">
            <button
              onClick={() => setLanguage("ru")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                language === "ru" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Русский
            </button>
            <button
              onClick={() => setLanguage("kk")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                language === "kk" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Қазақша
            </button>
          </div>
        </div>

        {/* Save */}
        {hasChanges && (
          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={isSaving}>
              {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {saved ? "Сохранено" : "Сохранить"}
            </Button>
          </div>
        )}
      </div>

      {/* Add Key Modal */}
      <Modal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} title="Добавить Kaspi API">
        <div className="space-y-4">
          <Input
            label="API ключ"
            type="password"
            placeholder="Введите ключ"
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
          />
          <Input
            label="Merchant ID"
            placeholder="Введите ID"
            value={newMerchantId}
            onChange={(e) => setNewMerchantId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Данные находятся в Kaspi Merchant Cabinet</p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowKeyModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveKey} isLoading={isKeyLoading} disabled={!newApiKey || !newMerchantId}>
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Удалить API ключ?">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Вы не сможете синхронизировать товары и отзывы пока не добавите новый ключ.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteKey} isLoading={isDeleting}>
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
