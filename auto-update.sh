#!/bin/sh
set -eu
umask 077
root=${DSM_THEME_ROOT:-}
state="$root/volume1/@dsm-liquid-glass"
unit=dsm-liquid-glass-update
units="$root/etc/systemd/system"
case ${1:-check} in
  enable)
    mkdir -p "$units"
    cat > "$units/$unit.service" <<'UNIT'
[Unit]
Description=Check for DSM Liquid Glass theme releases
After=network-online.target
RequiresMountsFor=/volume1

[Service]
Type=oneshot
ExecStart=/bin/sh /volume1/@dsm-liquid-glass/auto-update.sh check
UNIT
    cat > "$units/$unit.timer" <<'UNIT'
[Unit]
Description=Check for DSM Liquid Glass releases every six hours

[Timer]
OnBootSec=15min
OnUnitActiveSec=6h

[Install]
WantedBy=timers.target
UNIT
    systemctl daemon-reload
    systemctl enable "$unit.timer"
    systemctl start "$unit.timer"
    ;;
  disable)
    if [ -f "$units/$unit.timer" ]; then
      systemctl stop "$unit.timer"
      systemctl disable "$unit.timer"
      rm -f "$units/$unit.timer" "$units/$unit.service"
      systemctl daemon-reload
    fi
    ;;
  check)
    [ ! -e "$state/auto-disabled" ] || exit 0
    mkdir "$state/lock" || exit 1
    tmp=$(mktemp -d "$state/auto.XXXXXX") || { rmdir "$state/lock"; exit 1; }
    trap 'rm -rf "$tmp"; rmdir "$state/lock"' EXIT
    trap 'exit 1' HUP INT TERM
    url=$(curl --connect-timeout 15 --max-time 90 -fsSL -o /dev/null -w '%{url_effective}' https://github.com/konstpic/dsm-liquid-glass/releases/latest)
    tag=${url##*/}
    printf '%s\n' "$tag" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$'
    current=$(cat "$state/theme-version")
    if ! awk -v old="$current" -v new="$tag" 'BEGIN {
      split(substr(old,2), a, /[.]/); split(substr(new,2), b, /[.]/)
      for (i=1; i<=3; i++) { if (a[i]+0 < b[i]+0) exit 0; if (a[i]+0 > b[i]+0) exit 1 }
      exit 1
    }'; then echo "Theme is current ($current)."; exit 0; fi
    base="https://raw.githubusercontent.com/konstpic/dsm-liquid-glass/$tag"
    for name in theme.sha256 themes.js mobile.js; do
      curl --connect-timeout 15 --max-time 120 -fsSL "$base/$name" -o "$tmp/$name"
    done
    # Only allow theme payloads. The timer always uses locally installed shell code.
    (cd "$tmp" && sha256sum themes.js mobile.js > actual && cmp actual theme.sha256)
    cp "$state/install.sh" "$tmp/install.sh"
    sh "$state/refresh.sh" "$tmp"
    printf '%s\n' "$tag" > "$tmp/version"
    mv "$tmp/version" "$state/theme-version"
    echo "Installed theme $tag."
    ;;
  *) exit 2 ;;
esac
