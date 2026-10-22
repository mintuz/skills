#!/usr/bin/env bash
# Print a long alphanumeric string derived from a label. The same label and
# length always print the same string on every machine, so a creative
# direction can be traced back to its label and regenerated.
#
# The string is SHA-256 in counter mode: block N hashes "<label>\n<N>". Each
# byte below 248 maps to one character of [A-Za-z0-9] (248 = 4 * 62, so every
# character is equally likely); bytes 248 to 255 are skipped.
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
usage: seed.sh <label> [length]

Prints a string of letters and digits derived from <label>.
The same label and length always print the same string.
  label   for example <run-id>/<variant>, or <run-id>/<variant>/<reroll>
  length  number of characters, 1 to 1024 (default 64)
EOF
  exit 2
}

[ $# -ge 1 ] && [ $# -le 2 ] && [ -n "$1" ] || usage
label=$1
length=${2:-64}
case $length in '' | *[!0-9]*) usage ;; esac
length=$((10#$length))
[ "$length" -ge 1 ] && [ "$length" -le 1024 ] || usage

if command -v sha256sum >/dev/null 2>&1; then
  sha256() { sha256sum | cut -c1-64; }
elif command -v shasum >/dev/null 2>&1; then
  sha256() { shasum -a 256 | cut -c1-64; }
else
  echo "seed.sh: needs sha256sum or shasum" >&2
  exit 1
fi

alphabet=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
out=
block=0
while [ ${#out} -lt "$length" ]; do
  digest=$(printf '%s\n%d' "$label" "$block" | sha256)
  i=0
  while [ $i -lt 64 ] && [ ${#out} -lt "$length" ]; do
    byte=$((16#${digest:i:2}))
    if [ $byte -lt 248 ]; then
      out+=${alphabet:byte%62:1}
    fi
    i=$((i + 2))
  done
  block=$((block + 1))
done
printf '%s\n' "$out"
