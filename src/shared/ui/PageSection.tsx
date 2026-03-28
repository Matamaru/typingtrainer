import type { PropsWithChildren } from "react";

type PageSectionProps = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  className?: string;
}>;

export function PageSection({ title, eyebrow, className, children }: PageSectionProps) {
  return (
    <section className={className ? `page-section ${className}` : "page-section"}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}
