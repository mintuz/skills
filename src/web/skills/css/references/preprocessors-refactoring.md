# Preprocessor Guidelines and Refactoring

## @extend vs Mixins

**Use @extend for "same-for-a-reason"**: thematically related rulesets.

```scss
// OK - Same component variants
%btn-base {
  padding: 10px 20px;
  border: none;
}
.btn {
  @extend %btn-base;
}
.btn--primary {
  @extend %btn-base;
  background: blue;
}
```

**Use mixins for "same-just-because"**: coincidentally similar styles.

```scss
// Good - Repeated pattern, not related components
@mixin clearfix {
  &::after {
    content: "";
    display: table;
    clear: both;
  }
}
.header {
  @include clearfix;
}
.footer {
  @include clearfix;
}
```

**Why mixins are generally safer:**

- Repetition in compiled output is fine (gzip handles it); repetition in source is the problem
- Mixins don't disrupt source order
- Mixins don't create unexpected selector groupings

### Avoid & Concatenation for Class Names

```scss
/* Bad - .card-header not searchable in source */
.card {
  &-header {
  }
  &-body {
  }
}

/* Good - full class names are searchable */
.card {
}
.card-header {
}
.card-body {
}
```

**& is acceptable for:**

- Pseudo-classes: `&:hover`, `&:focus`
- Pseudo-elements: `&::before`, `&::after`
- State modifiers: `&.is-active`

## Performance Considerations

### Avoid CSS @import

```css
/* Bad - creates sequential download chain */
@import "components.css";
```

@import delays rendering with a request chain:

1. Browser requests HTML
2. HTML requests first CSS
3. First CSS requests second via @import
4. Rendering blocked until all complete

Better approaches: multiple link elements, which load in parallel, or concatenating files with a build tool:

```html
<!-- Multiple link elements load in parallel -->
<link rel="stylesheet" href="base.css" />
<link rel="stylesheet" href="components.css" />
```

### Finding Dead CSS

Use beacons when automated tools can't determine whether CSS is unused:

1. **Hypothesis:** identify selectors you believe come from deprecated features.
2. **Beacon:** add a transparent 1x1px GIF background with a unique URL. If any rule gives the matched elements a real image in any state, the beacon would replace it; log usage another way instead (for example a build-time class-usage report or a script that reports matched selectors):
   ```css
   .legacy-modal {
     background-image: url("/beacon.gif?selector=legacy-modal");
   }
   ```
3. **Verify delivery:** confirm one beacon request reaches the server logs. Caches, CSP `img-src`, and service workers can drop beacon requests.
4. **Monitor and delete** as the SKILL.md refactoring tree sets out, and watch for regressions after each increment.

## CSS Refactoring: The Three I's

The SKILL.md refactoring tree carries the core steps. Additionally:

1. **Identify:** leave stable code that rarely changes; limit scope to single features, not sweeping changes.
2. **Isolate:** build in proper encapsulation from the start.
3. **Implement:** document what can be removed once legacy code is gone.

## Code Smells Reference

### Critical Issues (Must Fix)

| Smell                    | Problem                           | Solution                                                |
| ------------------------ | --------------------------------- | ------------------------------------------------------- |
| Unexplained `!important` | Creates specificity arms race     | Restructure, or document an immutable external boundary |
| ID selectors             | No number of classes beats one ID | Use classes or `[id="x"]`                               |
| Shorthand causing resets | Unintentionally resets properties | Use longhand for precision                              |
| Broad selectors          | `header {}` affects too much      | Use specific class names                                |

### High Priority Issues

| Smell               | Problem                                    | Solution                                     |
| ------------------- | ------------------------------------------ | -------------------------------------------- |
| Magic numbers       | `top: 37px` has no context                 | Use relative values or CSS custom properties |
| Undoing styles      | `border: none` indicates poor architecture | Restructure to only add styles               |
| Qualified selectors | `ul.nav` limits reusability                | Remove element qualifiers                    |
| Deep nesting (4+)   | High cyclomatic complexity                 | Flatten selector structure                   |
| px for font-size    | Ignores user preferences                   | Use rem for accessibility                    |

### Style Improvements

| Smell                   | Problem                       | Solution                     |
| ----------------------- | ----------------------------- | ---------------------------- |
| Complex selectors       | Hard to reason about          | Create dedicated classes     |
| @extend abuse           | Greedy, disrupts source order | Prefer mixins                |
| String concatenation    | `&-bar` not searchable        | Write full class names       |
| Mixed margin directions | Unpredictable spacing         | Use single-direction margins |
