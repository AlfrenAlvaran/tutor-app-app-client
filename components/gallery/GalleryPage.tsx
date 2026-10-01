import fs from "fs";
import path from "path";
import ImageCarousel from "./ImageCarousel";

export default function GalleryPage() {
  const dir = path.join(process.cwd(), "public", "gallery");
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
    .sort();

  const images = files.map((file) => ({
    src: `/gallery/${file}`,
    alt: file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
  }));

  return (
    <main className="pt-16 bg-[#060a1c] min-h-screen">
      <ImageCarousel images={images} />
    </main>
  );
}