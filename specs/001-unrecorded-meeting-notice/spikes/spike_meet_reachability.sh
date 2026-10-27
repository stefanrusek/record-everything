#!/bin/sh
# Throwaway probe (constitution 3.1): read-only reachability of the real Google Meet landing page.
# Usage: spike_meet_reachability.sh <output-dir>   (writes headers only; body is not kept)
set -eu
out="$1"
mkdir -p "$out"
curl -sS -o /dev/null -D "$out/meet-landing.headers" -w 'http_code=%{http_code} final_url=%{url_effective} bytes=%{size_download}\n' -L https://meet.google.com/
