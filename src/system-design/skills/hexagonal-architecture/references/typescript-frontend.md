# TypeScript Frontend (React / Web) Example

Load this reference when implementing or reviewing a React or web frontend feature in an opted-in hexagonal repository. Load `react` and `react-testing` (or `xstate` for multi-step async lifecycles) alongside this reference.

## Boundaries in a Frontend Hexagon

- **Inside:** Pure domain rules (validation, pricing, filtering, permissions) and application use cases with driving/driven ports. Zero imports of React, router hooks, `fetch`, `window`, or `localStorage`.
- **Driving adapters (left):** React components, route loaders, and form handlers. They hold view-local UI state, invoke driving ports, and render domain results.
- **Driven adapters (right):** HTTP API clients (`fetch`), browser storage (`localStorage` / IndexedDB), and analytics/telemetry adapters. Parse untrusted API responses and stored JSON at the driven edge (`principle-parse-at-the-boundary`).
- **Composition root:** Application bootstrap (`AppProviders` / `composition.tsx`) builds concrete adapters once and injects driving ports into the component tree via React Context.

## 1. Pure Domain Rule and Ports (Inside)

```typescript
// src/drafts/domain/note-draft.ts
export type NoteDraft = { readonly title: string; readonly body: string };

export type PublishDecision =
  | { readonly valid: true; readonly draft: NoteDraft }
  | { readonly valid: false; readonly reason: 'empty-title' | 'body-too-long' };

export const validateNoteDraft = (draft: NoteDraft): PublishDecision => {
  const title = draft.title.trim();
  if (title.length === 0) return { valid: false, reason: 'empty-title' };
  if (draft.body.length > 5_000) return { valid: false, reason: 'body-too-long' };
  return { valid: true, draft: { title, body: draft.body } };
};
```

```typescript
// src/drafts/application/ports.ts
import type { NoteDraft } from '../domain/note-draft';

export type PublishNoteResult =
  | { readonly status: 'published'; readonly noteId: string }
  | { readonly status: 'rejected'; readonly reason: 'empty-title' | 'body-too-long' }
  | { readonly status: 'offline-saved' };

export interface ForPublishingNotes {
  readonly publish: (draft: NoteDraft) => Promise<PublishNoteResult>;
}

export interface NotesApi {
  readonly createNote: (draft: NoteDraft) => Promise<
    | { readonly ok: true; readonly noteId: string }
    | { readonly ok: false; readonly reason: 'offline' }
  >;
}

export interface DraftStorage {
  readonly savePending: (draft: NoteDraft) => void;
  readonly clearPending: () => void;
}
```

## 2. Use Case (Inside)

```typescript
// src/drafts/application/publish-note.ts
import { validateNoteDraft } from '../domain/note-draft';
import type { DraftStorage, ForPublishingNotes, NotesApi } from './ports';

export const createNotePublisher = (deps: {
  readonly api: NotesApi;
  readonly storage: DraftStorage;
}): ForPublishingNotes => ({
  publish: async (rawDraft) => {
    const decision = validateNoteDraft(rawDraft);
    if (!decision.valid) return { status: 'rejected', reason: decision.reason };

    const response = await deps.api.createNote(decision.draft);
    if (!response.ok) {
      deps.storage.savePending(decision.draft);
      return { status: 'offline-saved' };
    }

    deps.storage.clearPending();
    return { status: 'published', noteId: response.noteId };
  },
});
```

## 3. Driven Adapters (Outside)

Parse API responses and persisted browser data at the adapter edge so malformed payloads never enter the application.

```typescript
// src/drafts/adapters/fetch-notes-api.ts
import { z } from 'zod';
import type { NotesApi } from '../application/ports';

const CreatedNoteResponseSchema = z.object({ id: z.string().min(1) });

export const createFetchNotesApi = (baseUrl: string): NotesApi => ({
  createNote: async (draft) => {
    try {
      const response = await fetch(`${baseUrl}/notes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const parsed = CreatedNoteResponseSchema.parse(await response.json());
      return { ok: true, noteId: parsed.id };
    } catch (error) {
      if (error instanceof TypeError) return { ok: false, reason: 'offline' };
      throw error;
    }
  },
});
```

## 4. Composition Root and Thin React Driving Adapter (Outside)

Wire real adapters once at the root provider; components consume only the driving port contract.

```tsx
// src/app/composition.tsx
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ForPublishingNotes } from '../drafts/application/ports';
import { createNotePublisher } from '../drafts/application/publish-note';
import { createFetchNotesApi } from '../drafts/adapters/fetch-notes-api';
import { createLocalStorageDraftStorage } from '../drafts/adapters/local-storage-drafts';

const NotePublisherContext = createContext<ForPublishingNotes | null>(null);

export const NotePublisherProvider = ({
  publisher,
  children,
}: {
  readonly publisher?: ForPublishingNotes;
  readonly children: ReactNode;
}) => {
  const value = useMemo(
    () => publisher ?? createNotePublisher({
      api: createFetchNotesApi('/api'),
      storage: createLocalStorageDraftStorage(window.localStorage),
    }),
    [publisher],
  );
  return <NotePublisherContext.Provider value={value}>{children}</NotePublisherContext.Provider>;
};

export const useNotePublisher = (): ForPublishingNotes => {
  const ctx = useContext(NotePublisherContext);
  if (!ctx) throw new Error('NotePublisherProvider is required');
  return ctx;
};
```

```tsx
// src/drafts/adapters/NoteComposer.tsx — thin driving adapter
import { useState, type FormEvent } from 'react';
import { useNotePublisher } from '../../app/composition';

export const NoteComposer = () => {
  const publisher = useNotePublisher();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await publisher.publish({ title, body });
    if (result.status === 'published') setNotice('Note published.');
    else if (result.status === 'offline-saved') setNotice('Saved offline.');
    else setNotice(result.reason === 'empty-title' ? 'Add a title.' : 'Body exceeds 5,000 characters.');
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Body
        <textarea value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      <button type="submit">Publish</button>
      {notice && <p role="status">{notice}</p>}
    </form>
  );
};
```

When submit/retry/cancellation state grows non-trivial, model that UI lifecycle with `xstate` rather than adding ad-hoc boolean flags in the view.

## 5. Testing Frontend Hexagons

- **Primary (use-case tests):** Call `createNotePublisher` directly with stateful in-memory fakes (`createFakeNotesApi({ offline: true })`, `createFakeDraftStorage()`). Fast, zero DOM, zero `vi.mock()`.
- **Driving adapter tests (`react-testing`):** Render `<NoteComposer />` inside `<NotePublisherProvider publisher={createNotePublisher(...)} />` and assert user-visible DOM outcomes (`role="status"`).
- **Driven adapter tests:** Verify `createFetchNotesApi` against an HTTP stub (such as MSW) and `createLocalStorageDraftStorage` against corrupted/stale JSON strings.
