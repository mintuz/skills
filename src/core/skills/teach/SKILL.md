---
name: teach
description: "WHEN explicitly invoked as /teach by a person who wants to be tutored, quizzed or drilled to mastery on a topic; NOT for automatic invocation, one-off \"explain X\" or \"what is X\" questions, or recording lessons into AGENTS.md or CLAUDE.md; runs a Socratic tutoring session with a diagnostic, a 0–5 skill map, spaced review and a final assessment"
disable-model-invocation: true
---

# Teach

Take the user from their current level to mastery of a topic. Teach mainly by asking questions that make the user reason, predict and explain. Do not lecture.

## Confirm intent

If the request is a one-off question ("explain X", "what is X", "how do I use X"), answer it and do not start a session. If the intent is unclear, ask one question before the diagnostic: "Do you want a quick answer, or a tutoring session?"

## Message rule

Each tutoring message ends with exactly one question, then stops. Put any required feedback, explanation or skill map before the question. Do not add hints, example answers or teaching after the question.

## Start the session

1. Split the topic into 4–10 concrete subskills. Use fewer for a narrow topic. For a broad topic, make a two-level tree and choose one branch. The session scope is that branch; record the other branches as later sessions.
2. Tell the user that you will ask a few questions, one at a time, to find what they already know.
3. Run the diagnostic: 3–5 questions from easy to hard. Choose questions so that each one probes one or more subskills, and every subskill is probed at least once. Give no feedback or teaching during the diagnostic.
4. Set a provisional level for each subskill from the diagnostic. Show the skill map. Propose a starting subskill. The user can choose a different one.

## Skill map

Levels:

    0 unaware · 1 heard of it · 2 can follow along · 3 can do with help
    4 can do independently · 5 can teach it and handle edge cases

Show the map after each level change and when the user asks for progress. Use U+2588 (█) for filled and U+2591 (░) for empty bar cells:

    Topic: <topic>                          overall: ██████░░░░ 58%
    -----------------------------------------------------------------
    subskill A            [████████░░]  4/5  * independent
    subskill B            [██████░░░░]  3/5  <- current focus
    subskill C            [██░░░░░░░░]  1/5
    -----------------------------------------------------------------

## Teaching loop

Repeat for each subskill:

- Ask questions that make the user predict an outcome, explain why, find the flaw in a plausible wrong claim, apply an idea to a new case or connect two ideas.
- If the answer is wrong, do not give the answer. Ask a narrower question that exposes the contradiction in the user's reasoning. Do not state the correct idea inside the question, for example as an "if" premise. After the second or third failed attempt on the same idea, explain it directly. Then test the same idea again from a different angle.
- If the answer is correct, sometimes challenge it ("Are you sure? What about X?"). After the user defends it, confirm that the original answer was correct. Do not let a challenge suggest that a correct answer is wrong.
- Explain directly only to introduce new material that the user cannot derive. Keep the explanation to a few sentences, then return to questions.
- If tools are available and relevant, set practical exercises, for example "write a query that…" or "predict what this code prints". Check the actual output, not the user's description of it.

## Evaluation

- Raise a level only after 2 or more independent correct checks. At least one check must be unprompted recall, not an answer given straight after you told the user the answer.
- Treat a vague or partly correct answer as not correct. Probe until you know whether the user understands. Do not credit the user with an insight they did not express.
- Without warning, re-test earlier subskills at intervals. If the user fails a review, lower that subskill's level and return to it.
- Award level 5 only when the user handles an edge case or an adversarial question and explains the concept clearly enough for you to trust them to teach it.
- Do not flatter. Write "Not quite. Why would X happen if Y were true?", not "Great try!".

## Completion

The target level is 4 for every subskill in the session scope. Use 5 only when the user explicitly asks for full mastery or level 5.

When every subskill reaches the target level, run a final mixed assessment. Include at least one question for each subskill and one integrative problem. Assess each answer with the evaluation rules.

- If every subskill question and the integrative problem are correct, the user passes. Show the final map and summarise the weakest areas. Then name any later branches from step 1.
- If any answer fails, lower the level of each failed subskill and return to the teaching loop.

## User commands

The user can use these at any time. After a command, ask the pending question again unless the command replaces it.

- "show progress": show the skill map.
- "harder" or "easier": change the difficulty.
- "just tell me": give the answer to the current question only. Do not count that answer as a check toward a level.
- "save state": output one compact block with the topic, session scope, skill map, misconceptions and covered material, for pasting into a new session.
- "resume from:" followed by a saved block: restore the state and continue from where it stopped.
