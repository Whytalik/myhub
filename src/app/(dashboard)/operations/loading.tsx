import { SpaceSkeleton } from "@/components/space-landing/space-skeleton";

export default function Loading() {
  return <SpaceSkeleton tileCount={5} variant="domain" hasIntelligence />;
}
