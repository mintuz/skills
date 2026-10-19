# Specificity Management

## The Specificity Hierarchy

| Selector Type | Specificity | Example    |
| ------------- | ----------- | ---------- |
| Element       | (0,0,1)     | `div`      |
| Class         | (0,1,0)     | `.btn`     |
| Attribute     | (0,1,0)     | `[id="x"]` |
| ID            | (1,0,0)     | `#header`  |

## Safe Specificity Techniques

**Self-chain a selector to raise specificity:**

```css
.btn.btn {
  color: red;
} /* 0,2,0 - doubles specificity */
```

**Use attribute selectors instead of IDs:**

```css
/* Instead of #header (1,0,0) */
[id="header"] {
} /* 0,1,0 - same as class */
```

## Specificity Anti-Patterns

**Never use IDs for styling.** Specificity compares column by column, so no number of classes beats one ID:

```css
/* Bad */
#main-nav {
  display: flex;
}

/* Good */
.main-nav {
  display: flex;
}
```

**Don't qualify selectors with elements:**

```css
/* Bad - limits reusability, increases specificity */
ul.nav {
  list-style: none;
}

/* Good */
.nav {
  list-style: none;
}
```

**Avoid deep nesting (4+ levels):**

```css
/* Bad - high cyclomatic complexity */
div.sidebar .widget-area ul.links li a.external span {
}

/* Good */
.external-link-icon {
}
```

## The !important Rule

### Prefer the Normal Cascade

In styles you control, resolve conflicts through source order, layers, or simpler selectors:

```css
/* Bad - reactive !important */
.sidebar .btn {
  color: red !important;
}
```

Use one documented, property-scoped `!important` on the app class instead of copying the foreign ID chain only when both hold:

- The boundary is immutable: source order, layers, markup, and the foreign selector cannot change.
- The foreign declaration is a normal (not `!important`) author stylesheet rule.

```css
.checkout__submit {
  color: blue !important; /* Vendor ID rule is immutable. */
}
```

If the foreign declaration is itself `!important`, the class declaration above loses, because specificity decides between two unlayered important declarations. Put the app's important declaration in a layer instead: among author stylesheet rules in the same encapsulation context (no shadow DOM boundary between them), a layered important declaration beats an unlayered one regardless of specificity (see Cascade Layers). Inline `style` attributes, shadow-tree styles, and user-agent or user styles sit outside this ordering.

### When !important Is Correct (Proactive)

```css
/* Good - proactive !important for utilities */
.u-hidden {
  display: none !important;
}
.u-float-left {
  float: left !important;
}
```

### Preferred Normal-Cascade Fixes

1. **Self-chain the selector:** `.btn.btn { color: red; }`
2. **Rewrite an ID rule you own as an attribute selector:** `[id="sidebar"] .btn { color: red; }` has specificity (0,2,0). This works only when you can edit the ID rule itself; it does not beat a foreign `#sidebar .btn` rule (1,1,0).
3. **Restructure cascade order:** move your rule later in the stylesheet.
4. **Put your styles in cascade layers:** see below.

## Cascade Layers

`@layer` ranks rules before specificity. Precedence for normal declarations:

1. Unlayered styles beat every layered style.
2. Among layers, the later-declared layer wins.
3. Specificity and source order apply only after layer precedence: among declarations in the same layer, or among unlayered declarations.

```css
@layer reset, base, components;

@layer components {
  .btn { color: red; } /* beats base and reset, whatever their specificity */
}

.btn { color: blue; } /* unlayered: beats all layers */
```

For `!important` declarations the order reverses: an important declaration in an earlier layer beats one in a later layer, and both beat an unlayered important declaration.

**Consequence:** a layered normal app rule cannot beat an unlayered third-party rule, so layers fix normal-declaration conflicts only between styles you can place in layers. A layered important app rule does beat an unlayered important third-party rule.

## Shorthand Properties

### The Problem

A shorthand resets every related property, not only the ones you specify:

```css
/* This: */
.card {
  background: #fff;
}

/* Actually sets: */
.card {
  background-color: #fff;
  background-image: none; /* reset! */
  background-position: 0% 0%; /* reset! */
  background-size: auto auto; /* reset! */
  background-repeat: repeat; /* reset! */
  background-attachment: scroll; /* reset! */
}
```

### The Solution

```css
/* Bad */
.btn--primary {
  background: blue;
}

/* Good */
.btn--primary {
  background-color: blue;
}
```

### When Shorthand Is Acceptable

```css
padding: 10px; /* all four sides intentional */
margin: 12px 24px; /* vertical and horizontal intentional */
```
