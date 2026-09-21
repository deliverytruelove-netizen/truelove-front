// components/cliente/SafeImage.tsx
"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src" | "onError"> {
  src: string | null | undefined;
  fallback: React.ReactNode;
}

export default function SafeImage({ src, fallback, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <>{fallback}</>;

  return <Image src={src} onError={() => setFailed(true)} {...props} />;
}
