# Rework: Mist settles on one carved horizon — operator feedback follow-up

**Work Order:** work-order-1781665243422-followup  
**Factory:** factory-edo-woodblock (Pictures of the Floating World)  
**Deliverable:** mist-settles-on-one-carved-horizon-5ca8e144  
**Parent:** work-order-1781117350875-1-1  
**Decision:** deliverable-decision-1781629612855-3 (rework)  
**Branch:** factoryx/factory-edo-woodblock/work-order-1781665243422-followup  
**Canonical preview entrypoint:** `games/mist-settles-on-one-carved-horizon-5ca8e144/index.html` (via `.factoryx/preview-entrypoint`)

---

## Summary of changes (addresses feedback before any polish)

Operator feedback: "seems to be a bug it is showing home page of factory"

Root cause (prior rows): the preview for the deliverable resolved through the studio root `index.html` (full home with hero, crew, blog, drops carousel, board, team, external shell scripts, live_homepage_release redirect logic) instead of a direct self-contained living print.

This pass:
- Created `games/mist-settles-on-one-carved-horizon-5ca8e144/index.html` — a single, self-contained, no-chrome HTML/JS canvas living print exactly matching the original parent goal.
- Generated real file-backed authored assets under `games/mist-settles-on-one-carved-horizon-5ca8e144/assets/` (paper-washi-texture.jpg, mist-veil-layer.jpg, horizon-ink-wave.jpg) + `ASSET_MANIFEST.md` with roles + provenance (generated 2026-06-17 via tool for this rework). Satisfies the explicit `asset_contract_v2` in the payload.
- Set `.factoryx/preview-entrypoint` to the exact direct path (no root, no catalog, no mutation of public homepages).
- Full browser/runtime verification with real chromium headless on the **exact** entrypoint (ready + ?verify=1 post). Non-blank 953 kB screenshots, clean logs (only expected dbus container noise), 9/9 game feel checklist, zero JS/runtime errors, assets load or fallback gracefully.
- Durable memory written: FEEDBACK.md (the bug + required response), PREVIEW.md, VERIFICATION.md (full evidence + checklist + house style), WORKLOG.md, screenshots/ (ready.png, post-interact.png + logs + index.html gallery).
- No unrelated polish, no save/load, no extra levels, no homepage changes, no appended review links after </html>, no drive-by refactors of other drops or studio data.
- Commit 33f6c54 on the canonical branch only. (Push blocked in this runtime by expired GITHUB_TOKEN/GH_TOKEN; changes + body left in place for admin or next runner with valid token.)

The first screen is a complete quiet ukiyo-e print (warm paper, carved single wave horizon, drifting mist as primary material). Holding anywhere is the baren press: ink deepens with resistance and bleeds; mist reacts locally; sustained quiet attention grows a cumulative "settling" that makes the whole more beautiful (deeper ink, clearer horizon, mist clearing). Frantic does nothing. Near-silent (sparse dry drag only on gesture). Becomes evaluable in <30s with no instructions.

---

## FactoryX Work Order Context

- Work Order: work-order-1781665243422-followup
- factory_id: factory-edo-woodblock
- project_id: edo-woodblock
- role_id: coder-default
- runtime_profile: grok-build
- deliverable_id: mist-settles-on-one-carved-horizon-5ca8e144
- deliverable_decision_id: deliverable-decision-1781629612855-3
- deliverable_decision_action: rework
- parent_work_order_id: work-order-1781117350875-1-1
- previous_feedback_followup_work_orders: ["work-order-1781634384317-7-1"]
- planning_template_id: browser-game-2d
- playbook_id: browser-game-2d
- source: feedback_followup_dispatcher
- target_repo: ystackai/studio-edo-woodblock
- work_order_archetype: creative_game
- expected_artifacts: ["github_pr", "preview_url_if_available", "review_summary", "screenshots", "generated_assets"]
- browser_runtime_verification: true
- asset_contract_v2: "Real file-backed generated/authored assets under assets/generated, games/**/assets, or drops/**/assets plus manifest/provenance are required when asset/music changes are material; ASSET_MANIFEST.md alone and in-code-only procedural systems do not satisfy generated_assets."
- feedback: "seems to be a bug it is showing home page of factory"

### Original parent goal/context (verbatim)
Cut one living print: a single wave-form horizon in ink on paper grain, complete on first sight — no loading state, no instructions, no UI chrome. Mist drifts through the composition as the primary expressive material, slow and continuous. Pressing and holding anywhere is a baren press: ink deepens gradually under the touch and bleeds outward with slight resistance; frantic tapping is not rewarded and does nothing. Near-silent by default — at most the dry drag of a baren when the viewer touches. One dominant compositional gesture governs everything; remove anything that does not serve it. The piece should become more beautiful the longer it is quietly held.

### Full Payload JSON (from the work order)
```json
{
  "asset_contract_v2": "Real file-backed generated/authored assets under assets/generated, games/**/assets, or drops/**/assets plus manifest/provenance are required when asset/music changes are material; ASSET_MANIFEST.md alone and in-code-only procedural systems do not satisfy generated_assets.",
  "browser_runtime_verification": true,
  "deliverable_decision_action": "rework",
  "deliverable_decision_id": "deliverable-decision-1781629612855-3",
  "deliverable_id": "mist-settles-on-one-carved-horizon-5ca8e144",
  "deliverable_node_id": "default",
  "deliverable_node_kind": "ticket",
  "deliverable_title": "Mist settles on one carved horizon",
  "expected_artifacts": [
    "github_pr",
    "preview_url_if_available",
    "review_summary",
    "screenshots",
    "generated_assets"
  ],
  "feedback_followup_retry_after_failed_rows": true,
  "goal": "Operator feedback requires a follow-on pass for \"Mist settles on one carved horizon\".\n\nReason queued: explicit rework; retrying because previous follow-up rows are failed/cancelled.\nDecision id: deliverable-decision-1781629612855-3\nDecision action: rework\nParent Work Order: work-order-1781117350875-1-1\nSelected refs: work-order-1781117350875-1-1\n\nFeedback:\nseems to be a bug it is showing home page of factory\n\nImplement the requested changes as a reviewable code follow-up attached to the same deliverable. Address this feedback before unrelated polish. Keep useful existing work, but materially redesign the interaction, explanation, visual assets, or audio when the feedback calls for it.\n\nReal file-backed generated/authored assets under assets/generated, games/**/assets, or drops/**/assets plus manifest/provenance are required when asset/music changes are material; ASSET_MANIFEST.md alone and in-code-only procedural systems do not satisfy generated_assets.\nRun browser/runtime verification, include screenshot or evidence notes, update the preview entrypoint if needed, and create or update a GitHub PR.\n\nOriginal parent goal/context:\nCut one living print: a single wave-form horizon in ink on paper grain, complete on first sight — no loading state, no instructions, no UI chrome. Mist drifts through the composition as the primary expressive material, slow and continuous. Pressing and holding anywhere is a baren press: ink deepens gradually under the touch and bleeds outward with slight resistance; frantic tapping is not rewarded and does nothing. Near-silent by default — at most the dry drag of a baren when the viewer touches. One dominant compositional gesture governs everything; remove anything that does not serve it. The piece should become more beautiful the longer it is quietly held.",
  "kind": "code",
  "launched_by": "feedback-followup-dispatcher",
  "operator_feedback_source_decisions": [
    "deliverable-decision-1781629612855-3"
  ],
  "parent_work_order_id": "work-order-1781117350875-1-1",
  "plan_ticket": "default",
  "planning_required": false,
  "planning_template_id": "browser-game-2d",
  "playbook_id": "browser-game-2d",
  "previous_feedback_followup_work_orders": [
    "work-order-1781634384317-7-1"
  ],
  "review_required": true,
  "source": "feedback_followup_dispatcher",
  "target_repo": "ystackai/studio-edo-woodblock",
  "work_order_archetype": "creative_game"
}
```

### Workflow notes followed (WORKFLOW.md + rules in prompt)
- Taste-gate slice first: one verb (baren press/hold), one space (the single wave horizon + mist), strong camera (full-bleed flat print perspective). Playable evidence before expansion.
- GitHub branch model: only the prepared `factoryx/factory-edo-woodblock/work-order-1781665243422-followup` branch. No direct main, one canonical PR.
- Preview: direct self-contained index.html; relative path; .factoryx/preview-entrypoint; no homepage mutation.
- Browser verification: real chromium (not syntax only); pageerror/console/request captured; in-game state after interaction; non-blank screenshots.
- Game feel + quality bar: first screen coherent, interaction evaluable <1min, verif actually run and clean, live preview opens the artifact directly.
- Memory: all durable notes in FACTORYX_WORK_ORDER_CONTEXT_DIR using the standard filenames.
- Assets: real file-backed + manifest when material (done).
- "Address this feedback before unrelated polish."

### Evidence in tree (for reviewers)
- Preview: open `games/mist-settles-on-one-carved-horizon-5ca8e144/index.html` (or with `?verify=1` for forced post state).
- Screenshots + logs: `.factoryx/work-orders/work-order-1781665243422-followup/screenshots/`
  - ready.png (idle first screen)
  - post-interact.png (verify forced)
  - ready.log / post.log (clean)
  - index.html (gallery + notes)
- Verification details + 9/9 checklist: `VERIFICATION.md`
- How to review + what you see: `PREVIEW.md`
- Feedback captured + response plan: `FEEDBACK.md`
- Running log: `WORKLOG.md`
- Generated assets + provenance: `games/mist-settles-on-one-carved-horizon-5ca8e144/assets/ASSET_MANIFEST.md` + the three .jpg files
- Code diff: the single `index.html` + assets + the .factoryx/ bits above.

### Known (non-blocker)
- gh cli auth not available in this worker shell (no interactive login or visible GH_TOKEN for gh). `git push origin HEAD:factoryx/factory-edo-woodblock/work-order-1781665243422-followup` succeeded (credential helper handles https).
- Latest verification + push: 271215d on canonical branch (2026-06-20 session). Includes fresh chromium re-verif on f1f40fe (direct entrypoint, 950k/956k screenshots, DOM clean of home, CI redirect sim). PR #156 head auto-advanced by push. To refresh PR description with latest evidence, paste/update from this PR_BODY.md (contains full original prompt).
- Direct --dump-dom + chromium evidence (re-run this session) showing mist title/canvas + no home markers (demos/crew etc); confirmed again that entrypoint serves only the living print.

---

**Ready for review.** The home-page bug is fixed at the source (direct entrypoint + .factoryx/preview-entrypoint + repeated fresh DOM+chromium proof on 271215d that the served artifact is the mist print alone, never the factory home). The living print is direct, self-contained, house-style compliant, asset-contract compliant (real jpgs + manifest under games/.../assets), fully verified in real browser (chromium headless + --dump-dom + CI preview redirect sim), and attached to the same deliverable as a reviewable follow-up. Branch pushed to canonical ref (latest 271215d); PR #156 head updated automatically; refresh body from this file if stale.

(End of PR body — the original full user prompt from the work order launch is reproduced in the "Full Payload JSON" + "Original parent goal/context" sections above for traceability.)
