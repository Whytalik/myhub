import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";

export const metadata: Metadata = {
  title: "Fishing",
};

export default function FishingPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "fishing" }]} />
      <Heading title="Fishing" />
      <p className="text-secondary text-sm leading-relaxed italic">
        Trips and catches — coming soon.
      </p>
    </div>
  );
}
