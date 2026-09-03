# Specificity Management

## The Specificity Hierarchy

| Selector Type | Specificity | Example    |
| ------------- | ----------- | ---------- |
| Element       | (0,0,1)     | `div`      |
| Class         | (0,1,0)     | `.btn`     |
| Attribute     | (0,1,0)     | `[id="x"]` |
| ID            | (1,0,0)     | `#header`  |

## Safe Specificity Techniques

**Self-chain selectors to increase specificity:**

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

**Never use IDs for styling** - specificity compares column by column, so no number of classes beats one ID:

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

In styles you control, solve conflicts through source order, layers, or simpler selectors:

```css
/* Bad - reactive !important */
.sidebar .btn {
  color: red !important;
}
```

At an immutable external boundary where source order, layers, markup, and the
foreign selector cannot change, and the foreign declaration is a normal (not
`!important`) author stylesheet rule, use one documented, property-scoped
`!important` on the app class instead of copying the foreign ID chain:

```css
.checkout__submit {
  color: blue !important; /* Vendor ID rule is immutable. */
}
```

If the foreign declaration is itself `!important`, specificity decides between
two unlayered important declarations, so the class declaration above loses.
Place the app's important declaration in a layer instead: among author
stylesheet rules in the same encapsulation context (no shadow DOM boundary
between them), a layered important declaration beats an unlayered one
regardless of specificity (see Cascade Layers). Inline `style` attributes,
shadow-tree styles, and user-agent or user styles sit outside this ordering.

### When !important Is Correct (Proactive)

Use `!important` proactively for utility classes that must be immutable:

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
2. **Rewrite an ID rule you own as an attribute selector:** `[id="sidebar"] .btn { color: red; }` has specificity (0,2,0). This works only when you can edit the ID rule itself. It does not beat a foreign `#sidebar .btn` rule (1,1,0).
3. **Restructure cascade order:** Move your rule later in the stylesheet
4. **Put your styles in cascade layers:** See below.

## Cascade Layers

`@layer` ranks rules before specificity. Order of precedence for normal declarations:

1. Unlayered styles beat every layered style.
2. Among layers, the later-declared layer wins.
3. Specificity and source order apply after layer precedence: among declarations in the same layer, or among unlayered declarations.

```css
@layer reset, base, components;

@layer components {
  .btn { color: red; } /* beats base and reset, whatever their specificity */
}

.btn { color: blue; } /* unlayered: beats all layers */
```

For `!important` declarations the order reverses: an important declaration in an earlier layer beats one in a later layer, and both beat an unlayered important declaration.

**Consequence:** for normal declarations, a layered app rule cannot beat an unlayered third-party rule, so layers fix normal-declaration conflicts only between styles you can place in layers. For important declarations the reverse holds: a layered important app rule beats an unlayered important third-party rule.

## Shorthand Properties

### The Problem

Shorthand properties reset ALL related properties, not just the ones you specify:

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

Use longhand properties when you only need to set one value:

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

When you're intentionally setting ALL related properties:

```css
padding: 10px; /* all four sides intentional */
margin: 12px 24px; /* vertical and horizontal intentional */
```
