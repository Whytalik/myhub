"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/actions/button";
import { upsertGiftedItemAction, removeGiftedItemAction } from "../actions/shopping-actions";
import { PRODUCTS } from "../products";
import { getProductSeasonMultiplier } from "../utils/seasonal-pricing";

interface GiftedItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  weekStart: string;
  seasonOverride?: string;
  itemId: string;
  itemName: string;
  productKey: string | null;
  unit?: "g" | "piece" | "ml";
  /** null when nothing gifted yet for this item this week — prefill value uses the item's static price. */
  existing: { value: number; quantityNote: string | null; note: string | null } | null;
  defaultValue: number;
}

export function GiftedItemDialog({
  isOpen,
  onClose,
  onSaved,
  weekStart,
  seasonOverride,
  itemId,
  itemName,
  productKey,
  unit = "g",
  existing,
  defaultValue,
}: GiftedItemDialogProps) {
  // Розраховуємо сезонну ціну за одиницю (кг, літр або штуку)
  const product = productKey ? PRODUCTS[productKey] : null;

  let seasonalUnitPrice: number | null = null;
  if (productKey && product && product.basePrice !== undefined) {
    const multiplier = getProductSeasonMultiplier(productKey, weekStart, seasonOverride);
    seasonalUnitPrice = product.basePrice * multiplier;
  }

  // Намагаємось розпарсити число з існуючого запису кількості (напр., "350 г" -> "350")
  const initialQty = () => {
    if (existing?.quantityNote) {
      const match = existing.quantityNote.match(/^(\d+(?:\.\d+)?)/);
      if (match) return match[1];
    }
    return "";
  };

  const [qty, setQty] = useState(initialQty());
  const [value, setValue] = useState(String(existing?.value ?? defaultValue));
  const [note, setNote] = useState(existing?.note ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQtyChange = (newQtyStr: string) => {
    setQty(newQtyStr);
    const numericQty = Number(newQtyStr);
    if (Number.isFinite(numericQty) && numericQty > 0 && seasonalUnitPrice !== null) {
      let calculatedValue = 0;
      if (unit === "piece") {
        calculatedValue = Math.round(numericQty * seasonalUnitPrice);
      } else {
        // g або ml (ціна вказана за 1000г / 1000мл)
        calculatedValue = Math.round((numericQty / 1000) * seasonalUnitPrice);
      }
      setValue(String(calculatedValue));
    }
  };

  const handleSave = async () => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      toast.error("Вкажіть коректну суму");
      return;
    }

    let finalQtyNote = null;
    if (qty.trim()) {
      const unitLabel = unit === "piece" ? "шт" : unit === "ml" ? "мл" : "г";
      finalQtyNote = `${qty.trim()} ${unitLabel}`;
    }

    setIsSaving(true);
    const response = await upsertGiftedItemAction({
      weekStart,
      itemId,
      productKey,
      value: numericValue,
      quantityNote: finalQtyNote,
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

  const qtyInputLabel = `Кількість (у ${unit === "piece" ? "штуках" : unit === "ml" ? "мілілітрах" : "грамах"})`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Подаровано: ${itemName}`}
      description="Вкажіть кількість або суму, яку це виключає з витрат"
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
        {seasonalUnitPrice !== null && (
          <label className="flex flex-col gap-1.5">
            <span className="text-label">{qtyInputLabel}</span>
            <Input
              type="number"
              min={0}
              placeholder={`напр. 350`}
              value={qty}
              onChange={(e) => handleQtyChange(e.target.value)}
            />
            <span className="text-[10px] text-zinc-500 font-mono">
              Сезонна ціна: {Math.round(seasonalUnitPrice)} ₴ / {unit === "piece" ? "шт" : "кг"}
            </span>
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-label">Сума, ₴</span>
          <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-label">Нотатка (необов&apos;язково)</span>
          <Input
            type="text"
            placeholder="напр. Принесли батьки"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
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
