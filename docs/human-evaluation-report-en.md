# Human Evaluation Report — Lectura Generated Lectures

**Module:** MCSSE-SE-01 — Software Construction, Architecture and Engineering  
**System:** Lectura (AI-assisted lecture deck generation)  
**Evaluators:** 3 independent human reviewers (E1, E2, E3)  
**Lectures evaluated:** 10  
**Scale:** 1–5 for Correctness, Completeness, Clarity, Ready-to-teach  
**Usability question:** Yes / With edits / No  
*(E1 originally used a 1–3 usable scale; mapped as 1 = No, 2 = With edits, 3 = Yes.)*

---

## 1. Evaluation protocol (short)

Each lecture deck was rated on four criteria:

| Criterion | What was judged |
|-----------|-----------------|
| **Correctness** | Accuracy of facts, terminology, examples, and technical content |
| **Completeness** | Coverage of the intended lecture topic / learning objectives |
| **Clarity** | Understandability and structure for MSc students |
| **Ready-to-teach** | How close the deck is to real classroom use |

Final question: *Would you use this lecture with students after light editing?*  
Options: **Yes** / **With edits** / **No**.

---

## 2. Mean scores by lecture

| Lecture | Mean Correctness | Mean Completeness | Mean Clarity | Mean Ready-to-teach | Mean overall (4 criteria) | Majority usable label |
|--------:|-----------------:|------------------:|-------------:|--------------------:|------------------------:|:----------------------|
| 1 | 3.33 | 2.67 | 2.67 | 2.67 | **2.83** | No |
| 2 | 3.33 | 3.00 | 2.33 | 2.33 | **2.75** | No |
| 3 | 3.33 | 3.33 | 2.67 | 2.67 | **3.00** | No |
| 4 | 3.00 | 3.33 | 2.33 | 2.33 | **2.75** | No |
| 5 | 3.33 | 2.67 | 2.00 | 2.00 | **2.50** | No |
| 6 | 3.67 | 2.67 | 2.00 | 2.33 | **2.67** | No |
| 7 | 3.33 | 2.33 | 2.67 | 2.33 | **2.67** | No |
| 8 | 4.33 | 3.00 | 3.33 | 2.33 | **3.25** | With edits |
| 9 | 3.67 | 2.00 | 3.00 | 2.33 | **2.75** | With edits |
| 10 | 3.00 | 3.00 | 2.67 | 2.00 | **2.67** | No |

**Module-level average (all lectures, all criteria):** **2.78 / 5**

---

## 3. Criterion-level summary

| Criterion | Overall mean | Comment |
|-----------|-------------:|---------|
| Correctness | **3.43** | Strongest dimension. Content is often reasonably accurate, though not consistently excellent. |
| Completeness | **2.80** | Coverage is mixed: main ideas are often present, but gaps remain. |
| Clarity | **2.57** | A clear weakness. Decks are frequently hard to follow, dense, or poorly structured. |
| Ready-to-teach | **2.33** | Weakest dimension. Decks are rarely judged close to classroom-ready. |

---

## 4. Usability votes

Across 30 usable judgments (10 lectures × 3 evaluators):

| Label | Count | Share |
|-------|------:|------:|
| No | 18 | 60% |
| With edits | 12 | 40% |
| Yes | 0 | 0% |

**By lecture (majority vote):**
- Lectures **1–7, 10** → **No**
- Lectures **8–9** → **With edits**
- **Yes** was never the majority for any lecture

---

## 5. Evaluator agreement / disagreement

| Evaluator | Mean across 4 criteria | Comment |
|-----------|-----------------------:|---------|
| E1 | 2.35 | Strict |
| E2 | 3.95 | Lenient |
| E3 | 2.05 | Strict |

**Comment:** Absolute scores differ substantially across reviewers. E2 is consistently more positive, while E1 and E3 are much stricter.  
Despite that disagreement, the **direction of the signal is shared**: even the most positive reviewer almost never says the decks are ready without edits, and nobody gives a majority “Yes”.

This suggests:
1. current decks are still draft-quality,
2. future evaluations should include a short calibration session,
3. absolute means should be interpreted carefully, while relative patterns (which criteria / lectures are weakest) are more reliable.

---

## 6. Main findings (English commentary)

### Overall conclusion
Human evaluation indicates that Lectura currently produces **useful lecture drafts**, but **not classroom-ready lecture decks**. The average quality is around the mid-low range of the 1–5 scale (**~2.8**). No lecture was judged ready for direct student use without edits by a majority of reviewers.

### What works relatively well
**Correctness** is the strongest criterion (**~3.4**).  
This suggests that the generation pipeline often produces content that is broadly on-topic and not filled with catastrophic factual failure. In other words, the main issue is not “everything is wrong”, but rather “the material is not yet teachable enough”.

### Where the main problems are
The weakest areas are:

1. **Ready-to-teach (~2.3)**  
   Evaluators do not see the decks as close to usable teaching materials.

2. **Clarity (~2.6)**  
   Structure, readability, and slide-level communicability need major improvement.

3. **Completeness (~2.8)**  
   Coverage is uneven; important parts of a lecture may be missing or underdeveloped.

**Interpretation:** Lectura is better at producing *content fragments / draft slides* than at producing *polished instructional decks*.

### Lecture-level pattern
- Relatively stronger: **Lecture 8** (overall mean **3.25**), then **Lecture 3** (**3.00**)
- Relatively weaker: **Lecture 5** (**2.50**)
- Even the best lecture remains only modestly above “acceptable draft” and still needs editing

### Practical implication for the project
For the next iteration of Lectura, improvement effort should prioritize:

1. **clarity / slide readability / structure**
2. **classroom readiness** (pacing, examples, activities, teachable flow)
3. **more even completeness** across objectives

Correctness should still be monitored, but it is not the primary bottleneck according to this human study.

---

## 7. Suggested one-paragraph summary (for email / report)

> We conducted a small human evaluation of 10 AI-generated MCSSE-SE-01 lecture decks with three independent reviewers. Using a 1–5 rubric for Correctness, Completeness, Clarity, and Ready-to-teach, the overall mean score was approximately 2.8/5. Correctness was the strongest criterion (~3.4), while Ready-to-teach (~2.3) and Clarity (~2.6) were the weakest. No lecture received a majority “Yes” for use after light editing; most lectures were judged “No”, and only lectures 8–9 reached a majority of “With edits”. These results suggest that Lectura currently generates promising drafts, but substantial human revision is still required before classroom use. Next development should focus less on raw content generation alone and more on clarity, pedagogical structure, and teachability.

---

## 8. Next steps recommended by this evaluation

1. Improve slide clarity and narrative structure in generation prompts / post-processing.
2. Add explicit checks for classroom readiness (examples, activities, pacing).
3. Re-run human evaluation after the next pipeline iteration, with a short calibration round first.
4. Report both mean scores and usability votes; keep inter-rater disagreement visible.

---

## Appendix A — Raw scores

### Evaluator 1

| L | Cor | Comp | Clar | Ready | Usable |
|--:|----:|-----:|-----:|------:|:------:|
| 1 | 2 | 2 | 2 | 2 | No |
| 2 | 2 | 3 | 2 | 1 | No |
| 3 | 3 | 3 | 2 | 2 | No |
| 4 | 3 | 4 | 2 | 2 | No |
| 5 | 3 | 3 | 2 | 2 | No |
| 6 | 3 | 3 | 2 | 2 | No |
| 7 | 3 | 2 | 3 | 2 | No |
| 8 | 4 | 3 | 3 | 2 | No |
| 9 | 3 | 1 | 2 | 1 | No |
| 10 | 2 | 3 | 2 | 1 | No |

### Evaluator 2

| L | Cor | Comp | Clar | Ready | Usable |
|--:|----:|-----:|-----:|------:|:------:|
| 1 | 5 | 3 | 3 | 4 | With edits |
| 2 | 5 | 4 | 3 | 4 | With edits |
| 3 | 4 | 4 | 4 | 4 | With edits |
| 4 | 4 | 5 | 4 | 4 | With edits |
| 5 | 5 | 4 | 3 | 3 | With edits |
| 6 | 5 | 4 | 3 | 3 | With edits |
| 7 | 5 | 4 | 4 | 4 | With edits |
| 8 | 5 | 3 | 4 | 3 | With edits |
| 9 | 5 | 3 | 4 | 4 | With edits |
| 10 | 4 | 4 | 4 | 4 | With edits |

### Evaluator 3

| L | Cor | Comp | Clar | Ready | Usable |
|--:|----:|-----:|-----:|------:|:------:|
| 1 | 3 | 3 | 3 | 2 | No |
| 2 | 3 | 2 | 2 | 2 | No |
| 3 | 3 | 3 | 2 | 2 | No |
| 4 | 2 | 1 | 1 | 1 | No |
| 5 | 2 | 1 | 1 | 1 | No |
| 6 | 3 | 1 | 1 | 2 | No |
| 7 | 2 | 1 | 1 | 1 | No |
| 8 | 4 | 3 | 3 | 2 | With edits |
| 9 | 3 | 2 | 3 | 2 | With edits |
| 10 | 3 | 2 | 2 | 1 | No |

---

*Related files:* `human-evaluation-rubric.md`, `human-evaluation-aggregated.csv`, `human-evaluation-aggregated.md`
