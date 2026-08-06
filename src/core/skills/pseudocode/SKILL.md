---
name: pseudocode
description: WHEN rendering pseudocode of how code composes—module boundaries, types, signatures, arguments, and execution flow—for code that exists or a change about to be built; NOT for code review, verdicts, diagrams, or implementation; returns the shape and a cited call graph.
---

# Pseudocode

Code has a **waterline**. Above it sits the **shape**: modules and their boundaries, types, signatures, the values that cross each boundary, and the order calls happen in. Below it sits syntax and the statements inside a body.

Render the shape and collapse everything below the waterline to intent. Only bodies are pseudo—every name, type, and path is read from the source and cited, or marked `[NEW]`. Run this read-only: the render is the deliverable, not the edit.

## 1. Frame the render

Name the entry points to trace from and the frame edge—the packages, services, and libraries that count as outside. Name each **wiring** to render: production, plus any composition root that substitutes a dependency, such as tests, local dev, or a feature flag.

Classify each entry point `existing` or `[NEW]`. For a `[NEW]` render, resolve the requirement it must satisfy and the existing code it attaches to.

**Complete when:** the entry points, the frame edge, every wiring, and the existing/`[NEW]` split are each explicit.

## 2. Read the parts

Follow every call from each entry point, opening each file on the path. For every function reached, record its file and line, its signature as written, the effects it causes, and the calls it makes.

Expand a path until it reaches a boundary crossing, a pure leaf, the frame edge, or a function already recorded. A path ends nowhere else.

For a `[NEW]` render, read the surrounding modules the change attaches to with the same rigour; parts that do not exist yet are derived from the requirement and marked.

**Complete when:** every path terminates on one of those four conditions, and every name that will appear in the render is either recorded with a file and line or marked `[NEW]`.

## 3. Render the shape

Write in the project's own language and naming, in three parts:

**Types** — every type, interface, or schema that crosses a boundary, declared with its fields. A type from outside the frame is named and marked external.

**Boundaries** — one row per module: what it owns, what it exposes, what it depends on, and what it hides behind that surface.

**Signatures** — grouped under their module, each carrying parameter names, parameter types, return type, and error type as written in the source. Each body collapses to a single line naming its intent.

Where the cut is not obvious, place it here:

| Above the waterline | Below it |
| --- | --- |
| An effect that leaves the process: network, database, filesystem, clock, randomness, environment | Pure local computation |
| A branch that changes which downstream call happens | A branch that only changes a returned value |
| A helper whose effect crosses the module edge | A private helper contained inside it |
| What is constructed and injected where | Framework and transport boilerplate |

**Complete when:** every type named in a signature is declared here or marked external, every module row states what it hides, and every signature matches its source or carries `[NEW]`.

## 4. Render the call graph

One graph per wiring, as an indented tree. Each edge reads `→ Receiver.method(arg: Type, arg: Type) : Return`, then its annotations, then its file and line. Order siblings by execution order.

```
submitCheckout(req: HttpRequest) : HttpResponse                          src/http/checkout.ts:14
  → Checkout.submit(cart: Cart, actor: UserId) : Receipt                 src/checkout/service.ts:31
      → Pricing.quote(cart: Cart) : Quote                                src/pricing/quote.ts:8
          → TaxRates.lookup(region: Region) : TaxTable  [boundary: network]   src/pricing/tax.ts:22
      → Payments.charge(quote: Quote, card: CardRef) : Receipt  [boundary: network]   src/payments/stripe.ts:40
      → Orders.insert(order: Order) : OrderId  [boundary: database]      src/orders/store.ts:17
      → Email.receipt(to: EmailAddress, receipt: Receipt) : void  [async]   src/mail/queue.ts:9
      → Checkout.release(cart: Cart) : void  [error: charge declined]    src/checkout/service.ts:58
```

Annotate every edge that is not a plain unconditional in-process call with at least one:

| Annotation | Meaning |
| --- | --- |
| `[if …]` | Happens only on the named condition |
| `[each …]` | Repeats over the named collection |
| `[async]` | Enqueued, scheduled, or not awaited on this path |
| `[error …]` | Happens on the named failure path |
| `[boundary: …]` | The effect leaves the process—name which |
| `[NEW]` | Does not exist yet |

A function already drawn appears as `→ Name (above)` in place of a second expansion.

**Complete when:** every edge names the values crossing it, every non-plain edge carries an annotation, every branch terminates on a step 2 condition, and each wiring that differs from production is drawn beside it.

## 5. Return the render

Lead with the entry points, the frame edge, and the wirings drawn. Then give the types, the boundary table, the signatures, and the call graphs.

Close with what the shape shows, stated as facts already visible in the render rather than as judgements: dependency cycles, a dependency pointing against the module layering, argument counts, functions reached from many callers, boundary crossings on the primary path, and paths no wiring covers. Name what stayed unread and why.

When the render is a plan for work about to be done, save it so the implementation can be checked against it.

**Complete when:** every citation resolves, every observation points at an element of the render, and every gap names what would close it.
