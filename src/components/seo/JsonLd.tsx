// JsonLd — renders one or more Schema.org graph nodes as
// <script type="application/ld+json">. Server component (no "use client"): the
// markup is in the SSR HTML so crawlers and AI engines read it on first fetch.

export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Schema is built from our own trusted data (no user input).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
