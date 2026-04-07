"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FALLBACK_SRC = "/diplomadoamparo.png";

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
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_SRC);

  useEffect(() => {
    setImageSrc(src || FALLBACK_SRC);
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
