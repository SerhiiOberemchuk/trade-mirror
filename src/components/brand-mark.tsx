import Image from "next/image";

type BrandMarkProps = {
  alt?: string;
};

export function BrandMark({ alt = "" }: BrandMarkProps) {
  return (
    <Image
      alt={alt}
      className="size-9"
      height={36}
      priority
      src="/brand-mark.svg"
      width={36}
    />
  );
}
