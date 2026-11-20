#!/bin/sh
# Install both web interfaces and keep an offline uninstaller on volume1.
set -eu
umask 077
root=${DSM_THEME_ROOT:-}
state="$root/volume1/@dsm-liquid-glass"
case ${1:-install} in install|uninstall) action=${1:-install} ;; *) echo "Usage: sh setup.sh [install|uninstall]" >&2; exit 2 ;; esac
[ "$(id -u)" = 0 ] || { echo "Run with sudo" >&2; exit 1; }
[ -d "$root/volume1" ] || { echo "Missing volume1" >&2; exit 1; }
[ ! -L "$state" ] || exit 1
mkdir -p "$state"
chmod 700 "$state"
mkdir "$state/lock" || { echo "Another operation is active" >&2; exit 1; }
work=$(mktemp -d "$state/work.XXXXXX") || { rmdir "$state/lock"; exit 1; }
cleanup() { rm -rf "$work"; rmdir "$state/lock"; }
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
if [ "$action" = uninstall ]; then
  for prefix in mobile- ''; do
    status=$(sh "$state/install.sh" "${prefix}status")
    if [ "$status" = 'Theme patch installed' ]; then sh "$state/install.sh" "${prefix}rollback"; fi
  done
  echo "Original files restored. Reload DSM."
  exit
fi
base=https://raw.githubusercontent.com/konstpic/dsm-liquid-glass/v1.0.0
for name in install.sh themes.js mobile.js; do
  curl -fsSL "$base/$name" -o "$work/$name"
done
(cd "$work" && sha256sum -c - <<'HASHES'
702f82ce7c88cf7c4c10a922279c8e673156cdff1457328c5c85a254144d18fa  install.sh
710b119cee8b8cc3b049873b5eb39a44dffc009fdca43fa8c96c6941ac363a51  themes.js
a1ab92d3fa6a5557db1ed4815e3d0c5165102dd44d54dd41c2f5de568ea8c1de  mobile.js
HASHES
)
for name in install.sh setup.sh; do
  case "$name" in install.sh) src="$work/install.sh" ;; setup.sh) src="$0" ;; esac
  cp "$src" "$work/saved-$name"
  mv -f "$work/saved-$name" "$state/$name"
done
old=$(sh "$state/install.sh" status)
sh "$state/install.sh" install "$work/themes.js"
if ! sh "$state/install.sh" mobile-install "$work/mobile.js"; then
  if [ "$old" = 'Theme patch absent' ]; then sh "$state/install.sh" rollback; fi
  exit 1
fi
echo "Desktop and mobile themes installed. Reload DSM."
