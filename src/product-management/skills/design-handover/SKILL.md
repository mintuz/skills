---
name: design-handover
description: "WHEN explicitly asked to use design-handover; NOT for general visual polish or implementation; packages accepted behavior and matching visual evidence."
disable-model-invocation: true
---

# Design handover

Use only when explicitly invoked. Transfer existing accepted decisions into one linked document and its durable assets. A request for general polish or one screenshot correction stays with the appropriate visual workflow, such as `visual-feedback`.

1. **Resolve scope and authority.** Read the named designs, accepted behavior and recorded human rulings. Track supersession and explicit departures; neither a tool's design nor the newest ambiguous comment automatically wins. Ask only for unresolved product decisions or required facts that existing evidence cannot supply. Implementation, publication, unrelated launch repair and new behavior decisions are separate work.
2. **Pair every in-scope state.** Assign a stable example ID and write Given/When/Then from the accepted behavior. Beside it, record:
   - a source link/locator and its authority or supersession status;
   - the matching visual link, labelled running-app capture, design export or exploratory mockup;
   - revision/build, fixture/state and capture conditions when relevant;
   - differences from the source design and the ruling authorizing each departure;
   - explicit missing evidence or unresolved decisions when an honest pairing is unavailable.

   | Example | Behavior | Source | Visual | Gap or departure |
   | --- | --- | --- | --- | --- |
   | EX-1 | Given a saved draft, when the form reopens, then the title is restored | Spec §3, accepted | Running-app capture, build 1842, fixture `draft-saved` | Matches the source |
   | EX-2 | Given an empty title, when the user submits, then the error is shown | Design export v4, departed by ruling R-12 | Exploratory mockup | Error copy follows R-12; no runtime capture yet |

3. **Save for the next session.** Use the project's existing destination and asset conventions, normally Markdown. Keep assets durable and linked, not ephemeral references to this chat. Reuse available capture/export tools without requiring a particular design service, renderer or framework. An unavailable current app leaves a capture gap; an outdated screenshot remains labelled historical and a mockup cannot become runtime proof.
4. **Check the transfer.** Account for every accepted state, verify each visual matches its example and provenance, check links, and retain unresolved decisions as gaps. Report the saved document and assets, accepted departures and remaining evidence gaps. Do not imply that packaging the handover implemented, approved or runtime-verified the behavior.
