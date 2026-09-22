#!/usr/bin/env bash
# Build Next.js standalone and pack a Hostinger-ready deploy archive (zip + tar.gz).
# Output: dist/belgi-deploy-YYYYMMDD-HHMMSS.zip (and .tar.gz)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STAMP="$(date +%Y%m%d-%H%M%S)"
DIST_DIR="dist"
STAGE_DIR="$DIST_DIR/stage-belgi-$STAMP"
ARCHIVE_BASE="belgi-deploy-$STAMP"

echo "==> npm run build (standalone)"
npm run build

STANDALONE=".next/standalone"
STATIC=".next/static"

if [[ ! -d "$STANDALONE" ]]; then
  echo "ERROR: $STANDALONE missing — ensure next.config has output: 'standalone'" >&2
  exit 1
fi
if [[ ! -d "$STATIC" ]]; then
  echo "ERROR: $STATIC missing after build" >&2
  exit 1
fi

echo "==> Stage deploy root"
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR"

# Standalone server (includes traced node_modules)
cp -R "$STANDALONE"/. "$STAGE_DIR/"

# Static assets + public
mkdir -p "$STAGE_DIR/.next"
cp -R "$STATIC" "$STAGE_DIR/.next/static"
if [[ -d public ]]; then
  cp -R public "$STAGE_DIR/public"
fi

# Legal markdown (loaded via process.cwd()/content/legal)
if [[ -d content ]]; then
  mkdir -p "$STAGE_DIR/content"
  cp -R content/. "$STAGE_DIR/content/"
fi

# Hostinger / ops helpers
cat > "$STAGE_DIR/README-DEPLOY.txt" <<'EOF'
Belgi.ai — Hostinger Node deploy (standalone)

1. Upload and unpack this archive into the Node app root on Hostinger.
2. Set Environment Variables from .env.hostinger.example
   (SUPABASE_SERVICE_ROLE_KEY, SECRETS_MASTER_KEY, SESSION_SECRET, OTP_PEPPER, …).
3. Start command:
     node server.js
   or:
     npm run start
   (PORT is provided by Hostinger.)
4. Site URL: https://belgi.nocode.uz
5. Locales: UZ = /  |  RU = /ru/

Do not commit .env into the archive.
EOF

if [[ -f package.json ]]; then
  # Minimal package.json so Hostinger can run `npm start` if needed
  node -e '
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));
    const out = {
      name: pkg.name,
      version: pkg.version,
      private: true,
      scripts: { start: "node server.js" },
      engines: { node: ">=20" }
    };
    fs.writeFileSync(process.argv[1], JSON.stringify(out, null, 2) + "\n");
  ' "$STAGE_DIR/package.json"
fi

echo "==> Clean macOS junk"
find "$STAGE_DIR" -type f \( -name "._*" -o -name ".DS_Store" \) -delete 2>/dev/null || true
find "$STAGE_DIR" -type d \( -name ".AppleDouble" -o -name "__MACOSX" \) -exec rm -rf {} + 2>/dev/null || true

mkdir -p "$DIST_DIR"
ZIP_PATH="$DIST_DIR/$ARCHIVE_BASE.zip"
TGZ_PATH="$DIST_DIR/$ARCHIVE_BASE.tar.gz"

echo "==> Create $ZIP_PATH"
export COPYFILE_DISABLE=1
(
  cd "$STAGE_DIR"
  zip -r -q "$ROOT/$ZIP_PATH" . \
    -x "*.DS_Store" -x "*__MACOSX*" -x "*.git*"
)
(
  cd "$STAGE_DIR"
  tar --exclude=".DS_Store" --exclude="._*" --exclude="__MACOSX" \
    -czf "$ROOT/$TGZ_PATH" .
)
unset COPYFILE_DISABLE

if command -v xattr >/dev/null 2>&1; then
  xattr -c "$ZIP_PATH" 2>/dev/null || true
  xattr -c "$TGZ_PATH" 2>/dev/null || true
fi

rm -rf "$STAGE_DIR"

ls -lh "$ZIP_PATH" "$TGZ_PATH"
echo "Done. Upload $ZIP_PATH to Hostinger Node app root and unpack."
