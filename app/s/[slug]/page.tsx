import type { Metadata } from "next";
import {
  PublicShareNotFound,
  PublicShareViewer,
} from "@/components/public-share-viewer";
import { getPublicSharedFile } from "@/lib/file-shares";

type Ctx = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const file = await getPublicSharedFile(slug);
  if (!file) {
    return { title: "Share not found — MarkStore" };
  }
  return {
    title: `${file.name} — Shared via MarkStore`,
    description: "Public read-only share on MarkStore",
    robots: { index: false, follow: false },
  };
}

export default async function PublicSharePage({ params }: Ctx) {
  const { slug } = await params;
  const file = await getPublicSharedFile(slug);
  if (!file) {
    return <PublicShareNotFound />;
  }
  return (
    <PublicShareViewer
      name={file.name}
      type={file.type}
      content={file.content}
      size={file.size}
    />
  );
}
