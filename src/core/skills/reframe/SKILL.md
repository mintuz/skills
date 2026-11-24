---
name: reframe
description: "WHEN explicitly invoked as /reframe to learn the expert terms for something the user is building; NOT WHEN the skill is not explicitly invoked, the user asks a one-off \"what is the term for X\" question, wants tutoring to mastery (teach) or wants the task made deeper (sharpen); returns ranked expert terms with confirmed citations, neighbouring fields, unmentioned concerns and a rewritten description"
disable-model-invocation: true
---

# Reframe

Teach the user the expert terms for what they are building. Borrow terms from neighbouring fields that solved the same problem. Then rewrite the user's description with those terms. Do not build the thing.

## Procedure

1. Read the user's own files, code and description. Do not work from a summary of them.
2. If the description could name more than one problem, list the two or three problems it could be. For each, give the one term that names it and the sign that tells it apart from the others. Pick the most likely problem, say why, and continue with it.
3. Give 8 to 12 terms, ranked by how much each would change what gets built. For each term, give:
   - the term and its meaning in one plain sentence;
   - the part of the user's description or code that it names;
   - one real project, paper or system that uses the term in that sense, with a link;
   - what the term lets the user ask an agent for.
4. Pick 2 or 3 neighbouring fields that solved the same shape of problem under other names. For each, state what carries over, where the analogy breaks and which terms come back.
5. Name what the user did not mention but should care about.
6. Rewrite the user's description with the new terms.

Add no filler.

## Citations

Open every link and confirm that the page uses the term in that sense. A title, a search snippet or memory is not confirmation (`principle-observe-dont-infer`). Cut each citation that you cannot confirm, and keep the term. If you cannot open links, for example because network access is unavailable, cut every citation and say that citations were cut for that reason (`principle-gaps-are-not-passes`).

## Related skills

Each skill below is a separate workflow. Do not run its procedure inside reframe. Give the reframe output, then name the skill for the part of the request that it owns.

- `in-your-own-words` restates the user's goal in plain words, without new terms. Name it when the user's goal is unclear, not only the vocabulary.
- `sharpen` makes the task deeper: expert practice, raw material, methods and independent evidence. Reframe changes the words in the description; sharpen changes the task. Name `/sharpen` when the user asks what an expert would do, what material to start from or what would prove the result right.
- `teach` tutors the user to mastery with questions and a skill map. Name `/teach` when the user wants to master the terms. Do not quiz the user.

Done: the reply contains steps 2 to 6 for the chosen problem, every remaining citation was opened and confirmed, and no part of the thing was built.
