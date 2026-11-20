#!/bin/sh
set -eu

command=${1:-}
patch=${2:-}
root=${DSM_THEME_ROOT:-}
version="$root/etc.defaults/VERSION"
bundle="$root/usr/syno/synoman/webman/desktop/dist/dsm.desktop.bundle.js"
state="$root/volume1/@dsm-local-themes"
marker='DSM-LOCAL-THEMES-BEGIN-v1'
case "$command" in
  mobile-install|mobile-rollback|mobile-status)
    command=${command#mobile-}
    bundle="$root/usr/syno/synoman/mobile/ui/mobile.js"
    state="$root/volume1/@dsm-local-mobile-themes"
    marker='DSM-LOCAL-MOBILE-THEMES-BEGIN-v1'
    ;;
esac

die() { printf '%s\n' "$*" >&2; exit 1; }
sha() { sha256sum "$1" | awk '{ print $1 }'; }

test "$(id -u)" -eq 0 || die "Run as DSM root"
test -f "$version" || die "DSM version file is unavailable"
test -f "$bundle" && test ! -L "$bundle" || die "DSM desktop bundle is unavailable or is a symlink"
grep -Eq '^buildnumber="?90080"?$' "$version" || die "Only DSM build 90080 has been verified for this patch"

case "$command" in
  install|rollback|status) ;;
  *) die "Usage: $0 install /path/to/themes.js | rollback | status" ;;
esac

if [ "$command" = status ]; then
  if grep -Fq "$marker" "$bundle"; then printf 'Theme patch installed\n'; else printf 'Theme patch absent\n'; fi
  exit
fi

umask 077
mkdir -p "$state"
test -d "$state" && test ! -L "$state" || die "Invalid patch state directory"
chmod 700 "$state"
mkdir "$state/lock" || die "Another theme patch operation is active"
new_bundle=""
new_gzip=""
new_brotli=""
changed=0

restore_copy() {
  original=$1
  destination=$2
  replacement=$(mktemp "${destination}.restore.XXXXXX") || return 1
  if cp -p "$original" "$replacement" && mv -f "$replacement" "$destination"; then return 0; fi
  rm -f "$replacement"
  return 1
}

cleanup() {
  code=$?
  trap - EXIT
  if [ "$code" -ne 0 ] && [ "$command" = install ] && [ "$changed" -eq 1 ]; then
    printf 'Patch failed; restoring original desktop files\n' >&2
    restore_copy "$state/desktop.js.original" "$bundle" || code=1
    for ext in gz br; do
      if [ -f "$state/desktop.js.$ext.original" ]; then
        restore_copy "$state/desktop.js.$ext.original" "$bundle.$ext" || code=1
      fi
    done
  fi
  for temporary in "$new_bundle" "$new_gzip" "$new_brotli"; do
    if [ -n "$temporary" ]; then rm -f "$temporary"; fi
  done
  rmdir "$state/lock"
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM HUP

if [ "$command" = install ]; then
  test -s "$patch" || die "Missing themes.js"
  if grep -Fq "$marker" "$bundle"; then
    test -f "$state/desktop.js.original" || die "Existing theme patch has no backup"
    printf 'Theme patch already installed\n'
    exit
  fi
  test ! -e "$state/desktop.js.original" || die "Existing backup needs review before reinstall"
  for ext in gz br; do
    test ! -L "$bundle.$ext" || die "Compressed bundle $ext is a symlink"
    if [ -e "$bundle.$ext" ]; then
      test -f "$bundle.$ext" || die "Compressed bundle $ext is not regular"
      case "$ext" in
        gz) command -v gzip >/dev/null || die "gzip unavailable" ;;
        br) command -v brotli >/dev/null || die "brotli unavailable" ;;
      esac
    fi
  done
  cp -p "$bundle" "$state/desktop.js.original"
  new_bundle=$(mktemp "${bundle}.theme.XXXXXX")
  cp -p "$bundle" "$new_bundle"
  {
    printf '\n;/* %s */\n' "$marker"
    cat "$patch"
    printf '\n/* DSM-LOCAL-THEMES-END-v1 */\n'
  } >>"$new_bundle"
  if [ -f "$bundle.gz" ]; then
    cp -p "$bundle.gz" "$state/desktop.js.gz.original"
    new_gzip=$(mktemp "${bundle}.gz.theme.XXXXXX")
    cp -p "$bundle.gz" "$new_gzip"
    gzip -c "$new_bundle" >"$new_gzip"
    gzip -t "$new_gzip"
  fi
  if [ -f "$bundle.br" ]; then
    cp -p "$bundle.br" "$state/desktop.js.br.original"
    new_brotli=$(mktemp "${bundle}.br.theme.XXXXXX")
    cp -p "$bundle.br" "$new_brotli"
    brotli -c "$new_bundle" >"$new_brotli"
    brotli -t "$new_brotli"
  fi
  {
    sha "$new_bundle"
    if [ -n "$new_gzip" ]; then printf 'gz %s\n' "$(sha "$new_gzip")"; fi
    if [ -n "$new_brotli" ]; then printf 'br %s\n' "$(sha "$new_brotli")"; fi
  } >"$state/patched.sha256"
  changed=1
  mv -f "$new_bundle" "$bundle"
  if [ -n "$new_gzip" ]; then mv -f "$new_gzip" "$bundle.gz"; fi
  if [ -n "$new_brotli" ]; then mv -f "$new_brotli" "$bundle.br"; fi
  printf 'Theme patch installed; original desktop bundle saved\n'
  exit
fi

test -f "$state/desktop.js.original" && test -f "$state/patched.sha256" || die "No original desktop backup is available"
expected=$(sed -n '1p' "$state/patched.sha256")
test "$(sha "$bundle")" = "$expected" || die "The desktop bundle changed since installation; automatic rollback would overwrite a different version"
for ext in gz br; do
  if [ -f "$state/desktop.js.$ext.original" ]; then
    expected=$(awk -v type="$ext" '$1==type {print $2}' "$state/patched.sha256")
    test -f "$bundle.$ext" && test "$(sha "$bundle.$ext")" = "$expected" || die "Compressed $ext bundle changed since installation"
  fi
done
for ext in gz br; do
  if [ -f "$state/desktop.js.$ext.original" ]; then
    restore_copy "$state/desktop.js.$ext.original" "$bundle.$ext"
  fi
done
restore_copy "$state/desktop.js.original" "$bundle"
rm -f "$state/desktop.js.original" "$state/desktop.js.gz.original" "$state/desktop.js.br.original" "$state/patched.sha256"
printf 'Original DSM desktop bundle restored\n'
