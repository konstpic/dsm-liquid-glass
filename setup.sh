#!/bin/sh
# Install both web interfaces and keep an offline uninstaller on volume1.
set -eu
umask 077
root=${DSM_THEME_ROOT:-}
state="$root/volume1/@dsm-liquid-glass"
case ${1:-install} in install|uninstall|update|apply-release|auto-on|auto-off) action=${1:-install} ;; *) echo "Usage: sh setup.sh [install|update|auto-on|auto-off|uninstall]" >&2; exit 2 ;; esac
[ "$(id -u)" = 0 ] || { echo "Run with sudo" >&2; exit 1; }
[ -d "$root/volume1" ] || { echo "Missing volume1" >&2; exit 1; }
[ ! -L "$state" ] || exit 1
mkdir -p "$state"
chmod 700 "$state"
if [ "$action" = update ]; then
  # Resolve the latest published release once, then fetch from that tag.
  latest=$(curl -fsSL -o /dev/null -w '%{url_effective}' https://github.com/konstpic/dsm-liquid-glass/releases/latest)
  tag=${latest##*/}
  printf '%s\n' "$tag" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$' || { echo "Unexpected release tag" >&2; exit 1; }
  loader=$(mktemp "$state/release.XXXXXX")
  trap 'rm -f "$loader"' EXIT
  curl -fsSL "https://raw.githubusercontent.com/konstpic/dsm-liquid-glass/$tag/setup.sh" -o "$loader"
  sh "$loader" apply-release
  exit
fi
mkdir "$state/lock" || { echo "Another operation is active" >&2; exit 1; }
work=$(mktemp -d "$state/work.XXXXXX") || { rmdir "$state/lock"; exit 1; }
cleanup() { rm -rf "$work"; rmdir "$state/lock"; }
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
case "$action" in
  auto-off)
    touch "$state/auto-disabled"
    sh "$state/auto-update.sh" disable
    exit ;;
  auto-on)
    test -s "$state/theme-version" || { echo "Install the theme first" >&2; exit 1; }
    sh "$state/auto-update.sh" enable
    rm -f "$state/auto-disabled"
    exit ;;
esac
if [ "$action" = uninstall ]; then
  if [ -f "$state/auto-update.sh" ]; then sh "$state/auto-update.sh" disable; fi
  for prefix in mobile- ''; do
    status=$(sh "$state/install.sh" "${prefix}status")
    if [ "$status" = 'Theme patch installed' ]; then sh "$state/install.sh" "${prefix}rollback"; fi
  done
  rm -f "$state/theme-version"
  echo "Original files restored. Reload DSM."
  exit
fi
base=https://raw.githubusercontent.com/konstpic/dsm-liquid-glass/v1.0.2
for name in install.sh themes.js mobile.js refresh.sh auto-update.sh; do
  curl -fsSL "$base/$name" -o "$work/$name"
done
(cd "$work" && sha256sum -c - <<'HASHES'
702f82ce7c88cf7c4c10a922279c8e673156cdff1457328c5c85a254144d18fa  install.sh
83bdd7b2aceb1f203a14cff5ccf1339c77f7c09040d4de0d2e768feef171a62e  themes.js
a1ab92d3fa6a5557db1ed4815e3d0c5165102dd44d54dd41c2f5de568ea8c1de  mobile.js
442f90ceb0637570f3b7c6ce0b115c33eee99fcc626aecdcfda6545a27b3136b  refresh.sh
ac734223a556a839dbb20a71eb520752bf219d897832cd696ea2335066fe70ad  auto-update.sh
HASHES
)
desktop=$(sh "$work/install.sh" status)
mobile=$(sh "$work/install.sh" mobile-status)
if [ "$action" = apply-release ] || { [ "$desktop" = 'Theme patch installed' ] && [ "$mobile" = 'Theme patch installed' ]; }; then
  sh "$work/refresh.sh" "$work"
else
old=$(sh "$work/install.sh" status)
sh "$work/install.sh" install "$work/themes.js"
if ! sh "$work/install.sh" mobile-install "$work/mobile.js"; then
  if [ "$old" = 'Theme patch absent' ]; then sh "$work/install.sh" rollback; fi
  exit 1
fi
fi
for name in install.sh refresh.sh auto-update.sh setup.sh; do
  case "$name" in install.sh|refresh.sh|auto-update.sh) src="$work/$name" ;; setup.sh) src="$0" ;; esac
  cp "$src" "$work/saved-$name"
  mv -f "$work/saved-$name" "$state/$name"
done
printf '%s\n' v1.0.2 > "$work/version"
mv "$work/version" "$state/theme-version"
if [ ! -e "$state/auto-disabled" ]; then sh "$state/auto-update.sh" enable; fi
echo "Desktop and mobile themes ready (v1.0.2). Reload DSM."
