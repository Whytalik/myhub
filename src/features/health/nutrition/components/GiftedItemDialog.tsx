"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/actions/button";
import { upsertGiftedItemAction, removeGiftedItemAction } from "../actions/shopping-actions";

interface GiftedItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  weekStart: string;
  itemId: string;
  itemName: string;
  productKey: string | null;
  /** null when nothing gifted yet for this item this week — prefill value uses the item's static price. */
  existing: { value: number; quantityNote: string | null; note: string | null } | null;
  defaultValue: number;
}

export function GiftedItemDialog({
  isOpen,
  onClose,
  onSaved,
  weekStart,
  itemId,
  itemName,
  productKey,
  existing,
  defaultValue,
}: GiftedItemDialogProps) {
  const [value, setValue] = useState(String(existing?.value ?? defaultValue));
  const [quantityNote, setQuantityNote] = useState(existing?.quantityNote ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleSave = async () => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      toast.error("Вкажіть коректну суму");
      return;
    }
    setIsSaving(true);
    const response = await upsertGiftedItemAction({
      weekStart,
      itemId,
      productKey,
      value: numericValue,
      quantityNote: quantityNote.trim() || null,
      note: note.trim() || null,
    });
    setIsSaving(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }
    toast.success(`${itemName} відмічено як подароване`);
    onSaved();
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    const response = await removeGiftedItemAction(weekStart, itemId);
    setIsRemoving(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }
    toast.success("Прибрано з подарованого");
    onSaved();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Подаровано: ${itemName}`}
      description="Вкажіть суму, яку це виключає з тижневих витрат"
      maxWidth="420px"
      footer={
        <>
          {existing && (
            <Button variant="ghost" onClick={handleRemove} isLoading={isRemoving}>
              Прибрати
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Скасувати
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Зберегти
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-label">Сума, ₴</span>
          <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-label">Кількість (необов&apos;язково)</span>
          <Input
            type="text"
            placeholder="напр. 2 кг замість 1"
            value={quantityNote}
            onChange={(e) => setQuantityNote(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-label">Нотатка (необов&apos;язково)</span>
          <Input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        {isSaving && (
          <div className="flex items-center justify-center gap-2 text-caption">
            <Loader2 size={14} className="animate-spin" />
            Збереження...
          </div>
        )}
      </div>
    </Dialog>
  );
}
