# External Bug Intake Guide

Use this guide when filing bugs from the desktop browser alpha playtest. The goal is to make each report reproducible by someone who did not watch the session.

Desktop Chromium is the current target. Mobile layout, touch input, production audio, Steam packaging, and final GPT Image 2 bitmap card art are outside this alpha handoff unless the issue blocks the desktop route.

## Build And Setup Fields

Record these fields before testing:

- Build label:
- Branch:
- Commit:
- Local URL:
- Browser and version:
- OS:
- Fresh install or continued save:
- Save reset before test: yes / no
- Tester name:
- Test date:

If you are using an agent worktree, copy the exact branch and commit from:

```bash
git branch --show-current
git rev-parse --short HEAD
```

## Severity Rubric

Use the highest severity that matches the player impact:

| Severity | Use when |
|---|---|
| Blocker | The app cannot boot, the run cannot start, progress is impossible, a required screen is blank, input is unusable, saves corrupt progress, or the final boss / final choice route cannot complete. |
| Major | A core alpha route works only with a workaround, combat rules or rewards look wrong, compendium/save/reload/debug-skip coverage is unreliable, or a shipped surface loses important information. |
| Minor | The route is playable but has confusing copy, weak feedback, layout roughness, missing noncritical metadata, or inconsistent presentation. |
| Polish | Visual, wording, timing, or comfort issues that do not affect understanding or completion of the desktop alpha route. |

When unsure, choose the lower severity and include enough evidence for triage to raise it.

## Route Tags

Add one or more route tags to the bug title or template:

- `title`
- `compendium`
- `map`
- `combat`
- `reward`
- `event`
- `shop`
- `rest`
- `boss`
- `final-choice`
- `save/reload`
- `debug-skip`

Examples:

- `[combat][major] End Turn button stays disabled after playing a 0-cost card`
- `[compendium][minor] Locked story badge count does not update after logbook unlock`
- `[debug-skip][boss][major] Debug skip reaches boss map with missing backdrop`

## Required Evidence

Attach or paste the following evidence whenever possible:

- Screenshot of the broken state.
- Console errors from browser devtools.
- Missing network URL or asset 404, if any.
- Route steps from title to the issue.
- Character used: Zhao Yun, Diao Chan, Cai Wenji, or Zhuge Liang.
- Whether `调试跳章` / debug skip was used.
- Save state note: fresh run, continued run, after reload, or after clear save.
- Expected result and actual result.
- Reproducibility: always, sometimes, or once.

For visual issues, include the full browser screenshot, not only a cropped element. For save or reload issues, include the screen where the save was created and the screen shown after reload.

## Debug Skip Use

`调试跳章` is a prototype acceleration control. It is valid evidence for cross-chapter QA, boss-route QA, and final-choice QA, but it is not normal progression evidence.

If a bug only happens after debug skip, tag it with `debug-skip` and set `Debug skip used` to `yes`. If the same bug also happens through normal map progression, include both routes.

## Copy-Ready Bug Report Template

```text
Title:
Severity: blocker / major / minor / polish
Route tags:

Build label:
Branch:
Commit:
Local URL:
Browser and OS:
Fresh install or continued save:
Save reset before test: yes / no

Character:
Debug skip used: yes / no
Route taken:

Expected:
Actual:

Steps to reproduce:
1.
2.
3.

Reproducibility: always / sometimes / once
Screenshot or artifact path:
Console errors:
Missing network URL or asset 404:
Save state note:
Additional notes:
```
