# Design red flags

Screen every candidate before synthesis. A red flag is a reason to revise or reject the shape.

## Shallow module

A shallow module exposes a large interface while hiding little complexity. Judge depth by the capability and policy hidden behind the public surface relative to the size of that surface. Prefer a simple interface backed by substantial behaviour.

A deep module differs from a deep call chain. A deep call chain scatters understanding across layers; a deep module concentrates capability behind one interface.

Look for these signs:

- Callers coordinate several methods to complete one operation.
- Public options expose internal stages or implementation choices.
- Learning the interface does not save the caller from learning the implementation.

## Information leakage

Information leakage makes multiple modules depend on the same internal decision. A representation, policy or protocol detail appears in more than one place, so changing it requires coordinated edits.

Public re-exports of transport or wire types are leakage. Parse external data into domain types behind the interface. Keep storage schemas, framework objects and protocol details private.

## Temporal decomposition

Temporal decomposition organises modules by execution order instead of the knowledge they own. Separate load, validate, transform and save stages often repeat one representation and its invariants across several boundaries.

Group code around domain knowledge and ownership. Methods that run at different times can still belong to one module when they protect the same decisions.

## Pass-through method

A pass-through method forwards the same arguments to another method with the same shape. It adds a layer without hiding complexity.

Remove it or move responsibility to the module that can complete the operation. Keep a forwarding boundary only when it adds policy, adaptation or a distinct abstraction.

## Split ownership

More than one module writes the same state or keeps its own copy of it. An agent that edits one writer cannot see the others, so their rules diverge.

Give each piece of state one owner. Other modules read it or ask the owner to change it.

## Mixed responsibilities

A small interface hides responsibilities that change for different reasons. Look for different owners, different failure, deploy or permission boundaries, or different rates of change behind one entry point.

Combine code in one module only when it shares meaning, rules, an owner or a lifecycle. Otherwise, give each responsibility its own module, even when the total public surface gets larger. A single entry point or a command type is correct when its commands share these things.

This flag agrees with Split ownership. Split ownership is about several modules that write the same state. Separate modules for different state give each piece of state one owner.

## Two ways to do one task

The design supports more than one way to do the same task. An agent copies whichever way it finds first, so every way keeps gaining callers.

Keep one way. Move callers off the others and delete them in the same change.

## Importable internals

A caller can import a module's internals. An agent takes the shortest path that compiles, so it imports them directly and they become part of the interface.

Make internals unreachable from outside the module, so an import from outside fails the build.

## Hand-synced list

Two or more places list the same items, and adding an item means editing every list. An agent that sees one list updates only that one.

Keep one list and derive the others from it. If a list cannot be derived, make the build fail when the lists disagree.
