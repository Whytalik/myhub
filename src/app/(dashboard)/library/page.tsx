import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SpaceLanding, SpaceError, ModuleQuickAccess, RecentItems } from "@/components/space-landing";
import { BookText, Sparkles, Video, GraduationCap } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Library Space",
};

async function fetchLibraryData(userId: string) {
  const [books, articles, videos, courses, reading] = await Promise.all([
    prisma.libraryItem.count({ where: { userId, type: "BOOK" } }),
    prisma.libraryItem.count({ where: { userId, type: "ARTICLE" } }),
    prisma.libraryItem.count({ where: { userId, type: "VIDEO" } }),
    prisma.libraryItem.count({ where: { userId, type: "COURSE" } }),
    prisma.libraryItem.findMany({
      where: { userId, status: "READING" },
      take: 3,
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return { books, articles, videos, courses, reading };
}

function LibraryCurrentlyReadingSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 mb-20">
      <div className="h-3 w-32 bg-raised rounded mb-6" />
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-bg/40">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function LibrarySpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  let libData: Awaited<ReturnType<typeof fetchLibraryData>> | null = null;
  let error: Error | null = null;

  try {
    libData = await fetchLibraryData(userId);
  } catch (e) {
    console.error("[LibrarySpace] Failed to load:", e);
    error = e instanceof Error ? e : new Error(String(e));
  }

  if (error || !libData) {
    return (
      <SpaceLanding
        header={{
          label: "library space",
          title: "Library Space",
          description: "Your personal knowledge repository. Organize books, articles, and courses to build your intellectual capital and track your learning journey.",
        }}
      >
        <SpaceError
          message="Failed to load space data. Please try refreshing the page later."
          developerError={error?.message ?? "Unknown error"}
        />
      </SpaceLanding>
    );
  }

  const d = libData;
  const totalItems = d.books + d.articles + d.videos + d.courses;

  const modules = [
    {
      title: "Books",
      href: "/library/books",
      description: "Manage your digital and physical book collection.",
      icon: BookText,
      count: `${d.books} items`,
    },
    {
      title: "Articles",
      href: "/library/articles",
      description: "Saved articles, research papers, and web readings.",
      icon: Sparkles,
      count: `${d.articles} items`,
    },
    {
      title: "Videos",
      href: "/library/videos",
      description: "Educational videos, documentaries, and tutorials.",
      icon: Video,
      count: `${d.videos} items`,
    },
    {
      title: "Courses",
      href: "/library/courses",
      description: "Track your progress in online courses and certifications.",
      icon: GraduationCap,
      count: `${d.courses} items`,
    },
  ];

  return (
    <SpaceLanding
      header={{
        label: "library space",
        title: "Library Space",
        description: "Your personal knowledge repository. Organize books, articles, and courses to build your intellectual capital and track your learning journey.",
      }}
      intelligence={{
        items: [
          { label: "Total Items", value: totalItems.toString() },
          { label: "Collections", value: "4" },
          { label: "Reading", value: d.reading.length.toString() },
          { label: "Completed", value: "—" },
        ],
      }}
    >
      <Suspense fallback={<LibraryCurrentlyReadingSkeleton />}>
        <RecentItems
          title="Currently Reading"
          items={d.reading.map((item) => ({
            title: item.title,
            subtitle: item.author || undefined,
            href: `/library/books/${item.id}`,
          }))}
          emptyMessage="Nothing in progress right now"
          actionLabel="Add Resource"
          actionHref="/library/books?new=true"
        />
      </Suspense>
      <ModuleQuickAccess modules={modules} />
    </SpaceLanding>
  );
}
