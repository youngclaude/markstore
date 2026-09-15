import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight text-white">
      <span className="relative inline-flex h-5 w-5">
        <span className="absolute left-0 top-0 h-[14px] w-[14px] rounded-[3px] bg-[#1D7BFF]" />
        <span className="absolute left-1 top-1 h-[14px] w-[14px] rounded-[3px] bg-[#4F9DFF]" />
        <span className="absolute left-2 top-2 h-[14px] w-[14px] rounded-[3px] bg-[#7BB6FF]" />
      </span>
      MarkStore
    </Link>
  );
}

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <span className="absolute left-0 top-0 h-[70%] w-[70%] rounded-md bg-[#1D7BFF]" />
      <span className="absolute left-[18%] top-[18%] h-[70%] w-[70%] rounded-md bg-[#4F9DFF]" />
      <span className="absolute left-[36%] top-[36%] h-[70%] w-[70%] rounded-md bg-[#7BB6FF]" />
    </span>
  );
}
