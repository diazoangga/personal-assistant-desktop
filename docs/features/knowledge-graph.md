# Feature — Knowledge Graph Explorer

Interactive node-link view of the concept/citation graph the Research Agent builds, rendered
with React Flow (`@xyflow/react`).

## Capabilities

| Capability | UI | Backend |
|---|---|---|
| Network visualization | `<KnowledgeGraph>` (React Flow) | `GET /api/graph/subgraph?topic=&depth=2` |
| Entity-type differentiation | node color/shape by `category` | `concept / method / model / task / dataset / metric / framework` |
| Typed links | edge labels | `relation_type` + `weight` from `concept_relationships` |
| Citation viewer | `<CitationViewer>` on paper-node click | `GET /api/citations/{id}` (abstract, authors, arXiv link, linked concepts) |

## Notes

- The backend's `relevant_subgraphs` accepts a topic label (resolved via
  `find_concepts_by_label`) and does bidirectional BFS to `max_depth` — wire `depth` to a
  small control.
- Selecting a node populates the Context Inspector; paper nodes open `<CitationViewer>` with
  metadata from the `citations` table and its connected concepts.
- Graph and matrix **share selection state**, so clicking a concept node can highlight the
  originating interest pill, and vice versa.

## UI states

- **Empty** — no graph for the topic yet → prompt to research it.
- **Loaded** — node-link diagram; pan/zoom; node click → Inspector.
- **Paper selected** — `<CitationViewer>` with full citation detail.

---

> **Source of truth:** `src/components/knowledge/KnowledgeGraph.tsx`,
> `src/components/knowledge/CitationViewer.tsx`, `src/hooks/useGraph.ts`. Backend:
> `personal-assistant/docs/storage/knowledge-store.md`.
