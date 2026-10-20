# Rethink

A system or repository redesigned from first principles, with fewer tools and moving parts (principle-redesign-from-first-principles).

1. **Write the outcome.** State the outcome that the system exists for, and the hard constraints: platforms, machine types, portability, and the capabilities that must not be lost.
2. **Inventory the system.** List each tool, script and configuration, and the job that it does. Mark each piece of hand-rolled code that an existing tool could replace.
3. **Fix the bar.** Before you compare designs, write the criteria (principle-fix-the-bar-first). Fewer tools and less custom code rank higher.
4. **Research the candidates.** Spawn one `adam-agent` for each candidate tool or framework. Each agent reports the jobs that the candidate covers, what it cannot do and what it costs to adopt.
5. **Compare the designs.** Compare two or three designs against the bar (principle-exhaust-the-design-space).
6. **Recommend one design.** Show diagrams of the current and the proposed system, the jobs that move, what is lost and the migration. Prefer one cutover to a gradual migration, unless a constraint needs phases (principle-outcome-oriented-execution).
7. **Implement after approval.** Continue with Implement. Prove that each existing capability still works on each machine type.
