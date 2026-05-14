#!/usr/bin/env bash
# =============================================================================
# PaceLab — Oracle Cloud ARM VM Setup Script
# Run once on a fresh Ubuntu 22.04 ARM VM.
# Usage: bash <(curl -s https://raw.githubusercontent.com/rafeyy-sxk/pacelab/main/setup_oracle.sh)
# =============================================================================
set -euo pipefail

REPO_URL="https://github.com/rafeyy-sxk/pacelab.git"
INSTALL_DIR="/opt/pacelab"
SERVICE_USER="pacelab"
LOG_FILE="/var/log/pacelab-setup.log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"; }
die()  { echo -e "${RED}[$(date '+%H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"; exit 1; }

log "========================================"
log " PaceLab Oracle Setup Starting"
log "========================================"

# ── [1/8] System packages ─────────────────────────────────────────────────────
log "[1/8] Installing system packages..."
sudo apt-get update -q
sudo apt-get install -y -q \
    git curl wget build-essential \
    software-properties-common \
    libssl-dev libffi-dev \
    python3-pip python3-venv \
    htop unzip jq

# ── [2/8] Python 3.13 ─────────────────────────────────────────────────────────
log "[2/8] Installing Python 3.13..."
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update -q
sudo apt-get install -y -q python3.13 python3.13-venv python3.13-dev

python3.13 --version || die "Python 3.13 install failed"
log "Python 3.13 installed: $(python3.13 --version)"

# ── [3/8] uv package manager ──────────────────────────────────────────────────
log "[3/8] Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

uv --version || die "uv install failed"
log "uv installed: $(uv --version)"

# ── [4/8] Service user + repo ─────────────────────────────────────────────────
log "[4/8] Creating service user and cloning repo..."
sudo useradd -r -m -s /bin/bash "$SERVICE_USER" 2>/dev/null || log "  User '$SERVICE_USER' already exists"

if [ -d "$INSTALL_DIR/.git" ]; then
    log "  Repo exists — pulling latest..."
    sudo -u "$SERVICE_USER" git -C "$INSTALL_DIR" pull
else
    sudo git clone "$REPO_URL" "$INSTALL_DIR"
    sudo chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
fi

# Create data directories
sudo mkdir -p "$INSTALL_DIR/data/raw" "$INSTALL_DIR/data/processed/laps" "$INSTALL_DIR/data/models"
sudo chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/data"

log "  Repo ready at $INSTALL_DIR"

# ── [5/8] Install ML pipeline dependencies ────────────────────────────────────
log "[5/8] Installing ML pipeline dependencies..."
sudo -u "$SERVICE_USER" bash -c "
    export PATH=\"\$HOME/.local/bin:\$PATH\"
    cd $INSTALL_DIR/packages/ml
    uv sync
" || die "ML dependency install failed"

log "  ML dependencies installed"

# ── [6/8] Run FastF1 data pipeline ───────────────────────────────────────────
log "[6/8] Running FastF1 data pipeline (full mode — 2023-2024)..."
log "  This downloads ~5GB of race data and takes 20-40 minutes."
log "  You can monitor progress: tail -f $LOG_FILE"

sudo -u "$SERVICE_USER" bash -c "
    export PATH=\"\$HOME/.local/bin:\$PATH\"
    export FASTF1_CACHE_DIR=\"$INSTALL_DIR/data/raw\"
    cd $INSTALL_DIR/packages/ml
    uv run python -m pacelab_ml.data.pipeline --mode full 2>&1
" | tee -a "$LOG_FILE" || warn "Pipeline had errors — check log. Continuing setup."

log "  Pipeline complete. Data at $INSTALL_DIR/data/processed/"

# ── [7/8] Install API dependencies + systemd service ─────────────────────────
log "[7/8] Setting up FastAPI service..."

sudo -u "$SERVICE_USER" bash -c "
    export PATH=\"\$HOME/.local/bin:\$PATH\"
    cd $INSTALL_DIR/apps/api
    uv sync
" || die "API dependency install failed"

# Write systemd unit
sudo tee /etc/systemd/system/pacelab-api.service > /dev/null << EOF
[Unit]
Description=PaceLab FastAPI
After=network.target

[Service]
User=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR/apps/api
Environment="PATH=$INSTALL_DIR/apps/api/.venv/bin:/usr/local/bin:/usr/bin:/bin"
Environment="DB_PATH=$INSTALL_DIR/data/processed/pacelab.duckdb"
ExecStart=$INSTALL_DIR/apps/api/.venv/bin/uvicorn pacelab_api.main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable pacelab-api
sudo systemctl restart pacelab-api

sleep 3
sudo systemctl is-active pacelab-api || warn "Service may not have started — check: sudo journalctl -u pacelab-api -n 50"

# ── [8/8] Firewall ────────────────────────────────────────────────────────────
log "[8/8] Opening firewall port 8000..."
sudo iptables -I INPUT -p tcp --dport 8000 -j ACCEPT
# Persist iptables rules
sudo apt-get install -y -q iptables-persistent
sudo netfilter-persistent save

# ── Final verification ────────────────────────────────────────────────────────
log "========================================"
log " Verifying setup..."
log "========================================"

sleep 2
HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null || echo "FAILED")
log "Health check: $HEALTH"

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")

echo ""
echo -e "${GREEN}========================================"
echo " PaceLab Setup Complete!"
echo "========================================"
echo " API status:  $(sudo systemctl is-active pacelab-api)"
echo " Public IP:   $PUBLIC_IP"
echo " Health URL:  http://$PUBLIC_IP:8000/health"
echo " API docs:    http://$PUBLIC_IP:8000/docs"
echo " Logs:        sudo journalctl -u pacelab-api -f"
echo -e "========================================${NC}"
echo ""
echo "⚠️  Remember to open port 8000 in Oracle Security List:"
echo "   Oracle Console → VCN → Security Lists → Add Ingress Rule"
echo "   Source CIDR: 0.0.0.0/0  |  Port: 8000  |  Protocol: TCP"
