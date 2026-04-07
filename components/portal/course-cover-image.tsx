"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FALLBACK_SRC = "/diplomadoamparo.png";
const LEGACY_VERCEL_ASSET = "https://portal-centrodeestudiosaua.vercel.app/diplomadoamparo.png";

export function CourseCoverImage({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const normalizedSrc = src === LEGACY_VERCEL_ASSET ? FALLBACK_SRC : src || FALLBACK_SRC;
  const [imageSrc, setImageSrc] = useState(normalizedSrc);

  useEffect(() => {
    setImageSrc(src === LEGACY_VERCEL_ASSET ? FALLBACK_SRC : src || FALLBACK_SRC);
  }, [src]);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setImageSrc(FALLBACK_SRC)}
    />
  );
}
