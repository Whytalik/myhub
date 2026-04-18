"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { upsertWishlistItemAction } from "../actions/wishlist-actions";
import type { WishlistItemData, UpsertWishlistItemInput, WishlistStatus } from "../types";
import type { TaskPriority } from "@/features/life/types";

interface WishlistFormProps {
  initialData?: WishlistItemData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS: { id: WishlistStatus; label: string; description: string }[] = [
  { id: "IDEA", label: "Idea", description: "Just a thought, not sure yet" },
  { id: "RESEARCHING", label: "Researching", description: "Comparing options, reading reviews" },
  { id: "WISH", label: "Wish", description: "Definitely want this specific item" },
  { id: "PLANNED", label: "Planned", description: "Actively saving or waiting for an event" },
  { id: "ORDERED", label: "Ordered", description: "Paid for, awaiting delivery" },
  { id: "BOUGHT", label: "Bought", description: "Item has been acquired" },
  { id: "GIFTED", label: "Gifted", description: "Received as a gift from someone" },
  { id: "ABANDONED", label: "Abandoned", description: "Decided against buying it" },
  { id: "REPLACED", label: "Replaced", description: "Found a better alternative" },
  { id: "CANCELLED", label: "Cancelled", description: "No longer wanted" },
];

const PRIORITY_OPTIONS = [
  { id: "LOW", label: "Low", description: "Nice to have someday" },
  { id: "MEDIUM", label: "Medium", description: "A solid want, fairly important" },
  { id: "HIGH", label: "High", description: "A strong need or desire" },
  { id: "URGENT", label: "Urgent", description: "Needed as soon as possible" },
];

const CURRENCY_OPTIONS = [
  { id: "UAH", label: "UAH", description: "Ukrainian Hryvnia" },
  { id: "USD", label: "USD", description: "United States Dollar" },
  { id: "EUR", label: "EUR", description: "Euro" },
];

export function WishlistForm({ initialData, onSuccess, onCancel }: WishlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<UpsertWishlistItemInput>({
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || "",
      description: initialData?.description || "",
      url: initialData?.url || "",
      imageUrl: initialData?.imageUrl || "",
      price: initialData?.price || undefined,
      currency: initialData?.currency || "UAH",
      priority: initialData?.priority || "MEDIUM",
      status: initialData?.status || "IDEA",
      category: initialData?.category || "",
      tags: initialData?.tags || [],
      necessity: initialData?.necessity || undefined,
      store: initialData?.store || "",
    },
  });

  const selectedStatus = watch("status");
  const selectedPriority = watch("priority");
  const selectedCurrency = watch("currency");

  const onSubmit = async (data: UpsertWishlistItemInput) => {
    setIsSubmitting(true);
    setError(null);

    // Ensure tags are submitted as an array of strings
    const payload = {
      ...data,
      tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : data.tags,
    };

    const result = await upsertWishlistItemAction(payload);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-muted tracking-widest px-1">Item Name</label>
          <Input {...register("name", { required: "Name is required" })} placeholder="What do you wish for?" autoFocus />
          {errors.name && <span className="text-red-500 text-[10px] font-mono">{errors.name.message}</span>}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-muted tracking-widest px-1">Description / Notes</label>
          <Input {...register("description")} placeholder="Add some details, specs, or reasons..." />
        </div>

        {/* URL & Image URL */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-muted tracking-widest px-1">Product URL</label>
            <Input {...register("url")} placeholder="https://..." type="url" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-muted tracking-widest px-1">Image URL</label>
            <Input {...register("imageUrl")} placeholder="https://image.jpg" type="url" />
          </div>
        </div>
        
        {/* Price, Currency, Store */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-muted tracking-widest px-1">Price</label>
            <Input {...register("price", { valueAsNumber: true })} placeholder="0.00" type="number" step="0.01" />
          </div>
           <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-muted tracking-widest px-1">Currency</label>
            <CustomSelect options={CURRENCY_OPTIONS} value={selectedCurrency} onChange={(val) => setValue("currency", val as string)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-muted tracking-widest px-1">Store</label>
            <Input {...register("store")} placeholder="Amazon, Rozetka, etc." />
          </div>
        </div>

        {/* Category & Tags */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-muted tracking-widest px-1">Category</label>
            <Input {...register("category")} placeholder="Gear, Home, Health..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-muted tracking-widest px-1">Tags (comma-separated)</label>
            <Input {...register("tags")} placeholder="fishing, tech, book" />
          </div>
        </div>

        {/* Status, Priority, Necessity */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-muted tracking-widest px-1">Status</label>
            <CustomSelect options={STATUS_OPTIONS} value={selectedStatus} onChange={(val) => setValue("status", val as WishlistStatus)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-muted tracking-widest px-1">Priority</label>
            <CustomSelect options={PRIORITY_OPTIONS} value={selectedPriority} onChange={(val) => setValue("priority", val as TaskPriority)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-muted tracking-widest px-1">Necessity (1-10)</label>
            <Controller
                name="necessity"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="1=Want, 10=Need"
                    min="1"
                    max="10"
                    onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                    value={field.value ?? ''}
                  />
                )}
              />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-mono">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
        <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>
        <Button disabled={isSubmitting} type="submit" className="min-w-[100px]">
          {isSubmitting ? "Saving..." : initialData ? "Update Wish" : "Add Wish"}
        </Button>
      </div>
    </form>
  );
}
