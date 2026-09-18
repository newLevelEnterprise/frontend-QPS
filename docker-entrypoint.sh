#!/bin/sh
set -e

listen_port="${PORT:-80}"
sed -i "s/listen 80;/listen ${listen_port};/" /etc/nginx/conf.d/default.conf

force="false"
hide="${HIDE_MOLD_FIELDS:-${VITE_HIDE_MOLD_FIELDS:-false}}"
if [ "$hide" = "true" ]; then
  force="true"
fi

hosts_raw="${RESTRICTED_HOSTS:-${VITE_RESTRICTED_HOSTS:-127.0.0.1,quant-copy-production.up.railway.app}}"
hosts_json=$(printf '%s' "$hosts_raw" | tr ',' '\n' | awk '
  BEGIN { printf "[" }
  {
    gsub(/^[ \t\r\n]+|[ \t\r\n]+$/, "", $0)
    if ($0 == "") next
    gsub(/["\\]/, "", $0)
    if (n++) printf ", "
    printf "\"%s\"", $0
  }
  END { printf "]" }
')

cat > /usr/share/nginx/html/ui-config.js <<EOF
window.__QUANT_UI_CONFIG__ = {
  forceRestricted: ${force},
  restrictedHosts: ${hosts_json}
};
EOF

exec nginx -g "daemon off;"
