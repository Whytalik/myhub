"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDashed, Barcode } from "lucide-react";
import type { ProductMappingOverviewItem } from "../services/product-mapping-service";
import { FoodMapperDialog } from "./FoodMapperDialog";

interface FoodMapperClientProps {
  initialOverview: ProductMappingOverviewItem[];
}

export function FoodMapperClient({ initialOverview }: FoodMapperClientProps) {
  // 1. Hooks
  const router = useRouter();
  const [openProductKey, setOpenProductKey] = useState<string | null>(null);

  // 2. Derived values
  const openItem = initialOverview.find((item) => item.productKey === openProductKey) ?? null;

  // 3. Handlers
  const handleClose = () => setOpenProductKey(null);
  const handleSaved = () => {
    setOpenProductKey(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-2">
      {initialOverview.map((item) => {
        const isMapped = Boolean(item.mapping);
        const statusClass = isMapped ? "text-emerald-400" : "text-zinc-500";
        const StatusIcon = isMapped ? CheckCircle2 : CircleDashed;

        return (
          <div
            key={item.productKey}
            className="glass-card p-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <StatusIcon size={16} className={`${statusClass} shrink-0`} />
              <div className="flex flex-col min-w-0">
                <span className="text-body truncate">{item.nameUk}</span>
                {isMapped && (
                  <span className="text-label truncate">
                    {item.foodName ?? `food ${item.mapping?.foodId}`}
                    {item.servingDescription ? ` · ${item.servingDescription}` : ""}
                    {item.source === "BARCODE" ? " · скан" : ""}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpenProductKey(item.productKey)}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-accent-nutrition hover:opacity-80 transition-opacity"
            >
              <Barcode size={13} />
              {isMapped ? "Змінити" : "Мапувати"}
            </button>
          </div>
        );
      })}

      {openItem && (
        <FoodMapperDialog
          isOpen
          onClose={handleClose}
          onSaved={handleSaved}
          productKey={openItem.productKey}
          productNameUk={openItem.nameUk}
        />
      )}
    </div>
  );
}
