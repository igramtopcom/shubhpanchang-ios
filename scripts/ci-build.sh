#!/bin/bash
# One CI run of igramtopcom/shubhpanchang-ios, the way Sondra iOS and Sanftly
# do it: the repository is public only for the run, private again on any exit.
#
#   bash scripts/ci-build.sh push                 # push main; the commit message picks the job ([sim] / [testflight])
#   bash scripts/ci-build.sh dispatch ios-sim.yml # run a workflow again with nothing new to push
#
# Start it with the agent's run_in_background, never with "&" (a backgrounded
# shell once left Sondra's repository stuck public). Tell the owner before it
# opens the repository and after it has closed it.
REPO=igramtopcom/shubhpanchang-ios
MODE=${1:-push}
WF=${2:-}
OUT=${OUT:-"$(dirname "$0")/../../ci-out"}
cd "$(dirname "$0")/.." || exit 1
rm -rf "$OUT"; mkdir -p "$OUT"

running () { gh run list -R "$REPO" --limit 20 --json status -q '[.[]|select(.status!="completed")]|length'; }

close () {
  # Close only when nothing is running: closing mid-run broke a build once.
  for i in $(seq 1 120); do
    [ "$(running)" = "0" ] && break
    sleep 30
  done
  for i in 1 2 3; do
    gh repo edit "$REPO" --visibility private --accept-visibility-change-consequences >/dev/null 2>&1 && break
    sleep 5
  done
  echo "visibility now: $(gh repo view "$REPO" --json visibility -q .visibility)"
}
trap close EXIT

echo "runs in progress before opening: $(running)"
gh repo edit "$REPO" --visibility public --accept-visibility-change-consequences || exit 1
echo "repo public at $(date +%T)"
# Pushing right after the change has been answered "repository is disabled".
sleep 30

SHA=$(git rev-parse HEAD)
RID=""
if [ "$MODE" = "dispatch" ]; then
  BEFORE=$(gh run list -R "$REPO" --workflow "$WF" --limit 1 --json databaseId -q '.[0].databaseId')
  ok=""
  for i in 1 2 3 4 5 6; do
    gh workflow run "$WF" -R "$REPO" --ref main 2>/dev/null && { ok=1; break; }
    echo "dispatch not accepted yet, retry $i"; sleep 15
  done
  [ -n "$ok" ] || exit 1
  for i in $(seq 1 36); do
    RID=$(gh run list -R "$REPO" --workflow "$WF" --limit 1 --json databaseId -q '.[0].databaseId')
    [ -n "$RID" ] && [ "$RID" != "$BEFORE" ] && break
    RID=""; sleep 5
  done
else
  ok=""
  for i in 1 2 3 4 5 6; do
    git push -q origin main 2>/dev/null && { ok=1; break; }
    echo "push not accepted yet, retry $i"; sleep 15
  done
  [ -n "$ok" ] || exit 1
  # Both workflows start on a push; only the one whose tag is in the commit
  # message runs a job, the other is skipped. Watch the tagged one.
  WF=ios-sim.yml
  git log -1 --format=%B | grep -qF '[testflight]' && WF=ios-testflight.yml
  for i in $(seq 1 36); do
    RID=$(gh run list -R "$REPO" --commit "$SHA" --workflow "$WF" --json databaseId -q '.[0].databaseId' 2>/dev/null)
    [ -n "$RID" ] && break
    sleep 5
  done
fi
[ -n "$RID" ] || { echo "no run found"; exit 1; }
echo "run $RID: https://github.com/$REPO/actions/runs/$RID"

gh run watch "$RID" -R "$REPO" --interval 30 --exit-status >/dev/null 2>&1
STATUS=$?
echo "run finished with status $STATUS at $(date +%T)"
gh run view "$RID" -R "$REPO" > "$OUT/summary.txt" 2>&1
[ "$STATUS" = 0 ] || gh run view "$RID" -R "$REPO" --log-failed > "$OUT/failed.log" 2>&1
for i in 1 2 3 4; do
  gh run download "$RID" -R "$REPO" -D "$OUT/artifacts" >/dev/null 2>&1 && break
  sleep 10
done
ls -R "$OUT" | head -40
