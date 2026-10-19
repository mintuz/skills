---
name: principle-earn-every-element
description: "WHEN adding UI controls, settings, options, API parameters or document sections; NOT observing a user journey or weighing scope trade-offs; keeps only elements with a stated user need."
---

# Earn Every Element

Justify each control or option by a user need; an element without one does not ship.

1. List each element you are about to add: control, setting, option, parameter or section. Beside each, name the user and the need it serves. "Might be useful", "simplifies the implementation" and "the template has it" are not needs.
2. Cut, defer or keep internal each element without a stated need. When the need is unknown, ask for it or record it as an open question; do not invent one.
3. Cut before you polish. Reach the minimal set first, then invest in quality, such as transitions, styling and wording, only on what remains.
4. Apply this to additions. It never licenses removing supported behaviour or guarantees, such as cancellation, clear errors or accessibility.

Library callers and document readers are users too: an option serves a caller's need, and a section answers a reader's question.

Distinct from: `principle-experience-first` (journey or scope trade-offs), `principle-subtract-before-you-add` (about to add a mechanism, owner or layer), `principle-foundational-thinking` (adding infrastructure or abstraction "for later").

Done: each element has a stated purpose; elements without one were cut, deferred or listed as open questions.
