#!/bin/sh
# Called by setup.sh with its lock held and verified release files in $1.
set -eu
release=$1
root=${DSM_THEME_ROOT:-}
stage="$release/stage"
mkdir -p "$stage/etc.defaults"
cp "$root/etc.defaults/VERSION" "$stage/etc.defaults/VERSION"
plan="$release/replacements"
: > "$plan"
for ui in desktop mobile; do
  case "$ui" in
    desktop) bundle=/usr/syno/synoman/webman/desktop/dist/dsm.desktop.bundle.js; backup=/volume1/@dsm-local-themes; prefix=; patch=themes.js ;;
    mobile) bundle=/usr/syno/synoman/mobile/ui/mobile.js; backup=/volume1/@dsm-local-mobile-themes; prefix=mobile-; patch=mobile.js ;;
  esac
  # Rehearse checksum-guarded removal and replacement before changing live files.
  mkdir -p "$stage$(dirname "$bundle")" "$stage$backup"
  for ext in '' .gz .br; do
    live="$root$bundle$ext"
    saved="$root$backup/desktop.js$ext.original"
    if [ -f "$live" ] || [ -e "$saved" ]; then
      [ -f "$live" ] && [ ! -L "$live" ] && [ -f "$saved" ] || { echo "Missing or changed bundle: $live" >&2; exit 1; }
      cp -p "$live" "$stage$bundle$ext"
      cp -p "$saved" "$stage$backup/desktop.js$ext.original"
      printf '%s\n' "$bundle$ext" >> "$plan"
    fi
  done
  cp -p "$root$backup/patched.sha256" "$stage$backup/patched.sha256"
  DSM_THEME_ROOT="$stage" sh "$release/install.sh" "${prefix}rollback" >/dev/null
  DSM_THEME_ROOT="$stage" sh "$release/install.sh" "${prefix}install" "$release/$patch" >/dev/null
  printf '%s\n' "$backup/patched.sha256" >> "$plan"
done
restore="$release/previous"
mkdir "$restore"
applied="$release/applied"
: > "$applied"
atomic_copy() {
  pending=$(mktemp "$2.update.XXXXXX") || return 1
  if cp -p "$1" "$pending" && mv -f "$pending" "$2"; then return 0; fi
  rm -f "$pending"
  return 1
}
undo() {
  code=$?
  trap - EXIT
  if [ "$code" -ne 0 ]; then
    while IFS= read -r path; do atomic_copy "$restore$path" "$root$path" || code=1; done < "$applied"
  fi
  exit "$code"
}
trap undo EXIT
trap 'exit 1' INT TERM HUP
while IFS= read -r path; do
  cmp -s "$stage$path" "$root$path" && continue
  mkdir -p "$restore$(dirname "$path")"
  cp -p "$root$path" "$restore$path"
  printf '%s\n' "$path" >> "$applied"
  atomic_copy "$stage$path" "$root$path"
done < "$plan"
