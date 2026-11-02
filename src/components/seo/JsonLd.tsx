/**
 * JsonLd — emits one or more schema.org graphs as `application/ld+json`.
 *
 * Pass any number of schema objects; falsy entries are skipped so callers can
 * write `<JsonLd schemas={[pageLd, faqs.length && faqLd]} />` without guards.
 * Server component — the markup lands in the initial HTML, which is what
 * crawlers read.
 */

type Schema = object | null | undefined | false

export default function JsonLd({ schemas }: { schemas: Schema[] }) {
  const valid = schemas.filter(Boolean) as object[]
  if (!valid.length) return null

  return (
    <>
      {valid.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify output is inert inside a ld+json script tag; the
          // `<` escape guards against a stray "</script>" in user-entered text.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  )
}
