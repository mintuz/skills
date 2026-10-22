---
name: creative-seed
description: "WHEN creating UI concepts, prototype designs or exploratory visual variants whose look is open; NOT for matching an agreed mock-up or repair rounds on a picked design; derives each variant's creative direction from a deterministic seed string that the design never shows."
---

# Creative seed

A **seed string** is a long string of letters and digits that `scripts/seed.sh` derives from a **label**. You read the string for patterns and turn them into a creative direction. The same label always prints the same string, so each direction can be traced and regenerated.

Run the script as `bash <absolute path of this folder>/scripts/seed.sh <label> [length]`. Run it with no arguments to see its usage.

## 1. Label each variant

Give each variant one label in the form `<run-id>/<variant>`, for example `checkout-concept/B`. Use one run ID for the whole run.

For a new alternative to an existing variant, keep that variant's label and add a reroll number, for example `checkout-concept/B/2`. This applies also when the variant came from an earlier run.

To regenerate a direction from an earlier run, use the label from its design record. The same label prints the same string.

**Complete when:** every variant has a label that no other variant in the run uses.

## 2. Print the string

Run the script with each label. Use the printed string exactly as the source of the direction. When the host cannot run the script, report that gap and stop this skill; a string that you write yourself cannot be regenerated.

**Complete when:** each variant has the string that the script printed for its label.

## 3. Read the string

Look below the surface: repeats, runs, case rhythm, the ratio of digits to letters, digit groups, special numbers (primes, dates, powers of two), letter shapes and positions. Use only patterns that the string contains.

Write the direction as decisions, each with the pattern that inspired it:

- palette, with colour values;
- typefaces and type scale;
- layout and grid;
- spacing and density;
- shape, for example corner radius and borders;
- motion;
- imagery or illustration;
- one signature motif.

**Complete when:** every open choice has a decision, and every decision names its source pattern.

## 4. Keep the fixed choices

Fixed choices win over the seed: the product's design tokens and components, the brand, the spec's states, each taste constraint from the user, and a text contrast of at least 4.5:1. With an existing design system, take colour (neutrals included), typefaces and shape from the system. The seed then directs only layout, composition, chart style, density, emphasis, motion and imagery. When a pattern suggests a choice that breaks a fixed rule, keep the rule and use another pattern.

**Complete when:** each decision either fills an open choice or matches a fixed one.

## 5. Build it well

Use your judgement to bring the direction to life and make it look great. The seed is inspiration: when a literal reading of a pattern makes the design worse, the better design wins.

## 6. Keep the string out of the design

The string is for your inspiration only. The design shows no part of it: visible text, alt text, file names, class names, IDs, comments, metadata and sample data stay free of the string and its fragments. Name each class and file for its role, for example `.hero`.

Record the label and the direction notes in the design record beside the variant, outside the artifact. A critic gets the goal, the bar and the artifact with its evidence (`gauntlet-loop` step 4), without the label, the string or the direction notes.

**Complete when:** a search of the artifact for each 6-character run of the string finds nothing, and the design record holds the label and the direction.

## 7. Freeze the direction

After a base is picked, for example by `arena` or by the user, its direction becomes the pinned tokens and motifs of the bar (`gauntlet-loop` step 1). Repair rounds fix gaps inside that direction; they print no new string and use no reroll label. A reroll belongs to a new exploration round that the user asks for.

## Hand back

List the label of each variant. State that the script prints the same string for the same label, so each direction can be regenerated.
