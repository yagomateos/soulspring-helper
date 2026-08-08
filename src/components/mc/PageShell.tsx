import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
}) {
  return (
    <div className="animate-rise space-y-3">
      {eyebrow ? (
        <span className="inline-flex rounded-full bg-primary-soft px-3.5 py-1 text-xs font-medium tracking-wide text-primary uppercase">
          {eyebrow}
        </span>
      ) : null}
      <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}