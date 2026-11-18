#!/usr/bin/env bash
# Runs Codex image generation for each job folder in parallel. Usage: bash run.sh [job ...]
set -u
B="$(cd "$(dirname "$0")" && pwd)"
JOBS=("$@"); [ ${#JOBS[@]} -eq 0 ] && JOBS=(flame-hero-a flame-hero-b sealed-slab)
for j in "${JOBS[@]}"; do
  args=(); for r in "$B/$j"/refs/*; do args+=(-i "refs/$(basename "$r")"); done
  ( cd "$B/$j" && codex exec --skip-git-repo-check -C . -s workspace-write "${args[@]}" < prompt.txt > codex.log 2>&1; echo "finished $j: $(ls *.png 2>/dev/null | tr '\n' ' ')" ) &
done
wait
echo ALL DONE
