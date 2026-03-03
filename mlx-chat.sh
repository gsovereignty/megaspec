#!/usr/bin/env bash
# mlx-chat: Interactive MLX model launcher for Apple Silicon
# Installs dependencies, lists installed/available models, and runs chat

set -euo pipefail

VENV_DIR="${MLX_VENV:-$HOME/.mlx-chat-venv}"
HF_CACHE_DIR="$HOME/.cache/huggingface/hub"

# Colors
BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[32m'
YELLOW='\033[33m'
CYAN='\033[36m'
RED='\033[31m'
RESET='\033[0m'

# Popular MLX models available for download (curated list)
RECOMMENDED_MODELS=(
  "mlx-community/Llama-3.3-70B-Instruct-4bit"
  "mlx-community/Meta-Llama-3.1-8B-Instruct-4bit"
  "mlx-community/Meta-Llama-3.1-8B-Instruct-8bit"
  "mlx-community/Mistral-7B-Instruct-v0.3-4bit"
  "mlx-community/Mistral-Small-24B-Instruct-2501-4bit"
  "mlx-community/Qwen2.5-7B-Instruct-4bit"
  "mlx-community/Qwen2.5-32B-Instruct-4bit"
  "mlx-community/Qwen2.5-32B-Instruct-8bit"
  "mlx-community/Qwen2.5-72B-Instruct-4bit"
  "mlx-community/Qwen2.5-Coder-32B-Instruct-4bit"
  "mlx-community/gemma-2-27b-it-4bit"
  "mlx-community/phi-4-4bit"
  "mlx-community/DeepSeek-R1-Distill-Qwen-32B-4bit"
  "mlx-community/DeepSeek-R1-Distill-Llama-70B-4bit"
)

header() {
  echo ""
  echo -e "${BOLD}${CYAN}╔══════════════════════════════════════╗${RESET}"
  echo -e "${BOLD}${CYAN}║        MLX Chat — Apple Silicon      ║${RESET}"
  echo -e "${BOLD}${CYAN}╚══════════════════════════════════════╝${RESET}"
  echo ""
}

info()  { echo -e "${CYAN}▸${RESET} $*"; }
ok()    { echo -e "${GREEN}✓${RESET} $*"; }
warn()  { echo -e "${YELLOW}⚠${RESET} $*"; }
err()   { echo -e "${RED}✗${RESET} $*"; }

# ── Step 1: Ensure venv and dependencies ─────────────────────────────────────

ensure_deps() {
  if [[ ! -d "$VENV_DIR" ]]; then
    info "Creating virtual environment at ${DIM}$VENV_DIR${RESET}"
    python3 -m venv "$VENV_DIR"
  fi

  source "$VENV_DIR/bin/activate"

  if ! python -c "import mlx_lm" 2>/dev/null; then
    info "Installing mlx-lm (this may take a minute)..."
    pip install --upgrade pip -q
    pip install mlx-lm -q
    ok "mlx-lm installed"
  else
    ok "mlx-lm already installed"
  fi
}

# ── Step 2: Discover installed models ────────────────────────────────────────

get_installed_models() {
  local models=()
  if [[ -d "$HF_CACHE_DIR" ]]; then
    while IFS= read -r dir; do
      # Convert "models--mlx-community--Model-Name" → "mlx-community/Model-Name"
      local name="${dir#models--}"
      name="${name//--//}"
      # Only include mlx-community models (LLMs, not whisper)
      if [[ "$name" == mlx-community/* ]] && [[ "$name" != *whisper* ]]; then
        models+=("$name")
      fi
    done < <(ls "$HF_CACHE_DIR" 2>/dev/null | grep "^models--mlx-community" || true)
  fi
  printf '%s\n' "${models[@]}"
}

# ── Step 3: Build menu ──────────────────────────────────────────────────────

show_menu() {
  local -a installed=()
  local -a available=()

  # Read installed models
  while IFS= read -r m; do
    [[ -n "$m" ]] && installed+=("$m")
  done < <(get_installed_models)

  # Build available list (recommended models NOT already installed)
  for rec in "${RECOMMENDED_MODELS[@]}"; do
    local found=0
    for inst in "${installed[@]}"; do
      if [[ "$rec" == "$inst" ]]; then
        found=1
        break
      fi
    done
    if [[ $found -eq 0 ]]; then
      available+=("$rec")
    fi
  done

  local idx=1

  # Show installed section
  if [[ ${#installed[@]} -gt 0 ]]; then
    echo -e "${BOLD}${GREEN}  Installed models${RESET}"
    echo -e "${DIM}  ─────────────────────────────────────────${RESET}"
    for m in "${installed[@]}"; do
      local short="${m#mlx-community/}"
      printf "  ${GREEN}%3d${RESET})  %-45s ${DIM}[ready]${RESET}\n" "$idx" "$short"
      ((idx++))
    done
    echo ""
  else
    warn "No MLX models installed yet."
    echo ""
  fi

  # Show available section
  if [[ ${#available[@]} -gt 0 ]]; then
    echo -e "${BOLD}${YELLOW}  Available to download${RESET}"
    echo -e "${DIM}  ─────────────────────────────────────────${RESET}"
    for m in "${available[@]}"; do
      local short="${m#mlx-community/}"
      printf "  ${YELLOW}%3d${RESET})  %-45s ${DIM}[download]${RESET}\n" "$idx" "$short"
      ((idx++))
    done
    echo ""
  fi

  local total=$((idx - 1))
  echo -e "${DIM}  Or type a Hugging Face model ID (e.g. mlx-community/Some-Model-4bit)${RESET}"
  echo ""

  # Read user choice
  while true; do
    echo -ne "${BOLD}  Select model [1-${total}] or ID: ${RESET}"
    read -r choice

    # If it looks like a HF model ID, use it directly
    if [[ "$choice" == */* ]]; then
      SELECTED_MODEL="$choice"
      return
    fi

    # Validate numeric choice
    if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= total )); then
      # Map index to model name
      local all_models=()
      for m in "${installed[@]}"; do all_models+=("$m"); done
      for m in "${available[@]}"; do all_models+=("$m"); done
      SELECTED_MODEL="${all_models[$((choice - 1))]}"
      return
    fi

    err "Invalid selection. Try again."
  done
}

# ── Step 4: Choose mode ─────────────────────────────────────────────────────

choose_mode() {
  echo -e "${BOLD}${CYAN}  How do you want to use this model?${RESET}"
  echo -e "${DIM}  ─────────────────────────────────────────${RESET}"
  echo -e "  ${GREEN}1${RESET})  Terminal chat          ${DIM}— interactive conversation in this terminal${RESET}"
  echo -e "  ${GREEN}2${RESET})  Serve API for Copilot  ${DIM}— OpenAI-compatible server on localhost${RESET}"
  echo ""

  while true; do
    echo -ne "${BOLD}  Select mode [1-2]: ${RESET}"
    read -r mode_choice
    case "$mode_choice" in
      1) RUN_MODE="chat"; return ;;
      2) RUN_MODE="server"; return ;;
      *) err "Invalid selection. Enter 1 or 2." ;;
    esac
  done
}

# ── Step 5: Run the model ───────────────────────────────────────────────────

run_chat() {
  local model="$1"
  echo ""
  info "Loading ${BOLD}$model${RESET}..."
  echo -e "${DIM}  (First run will download the model weights — this can take a while)${RESET}"
  echo ""
  echo -e "${DIM}  Type your messages below. Press Ctrl+C to exit.${RESET}"
  echo -e "${DIM}  ─────────────────────────────────────────${RESET}"
  echo ""

  python3 -m mlx_lm chat \
    --model "$model" \
    --max-tokens 4096
}

run_server() {
  local model="$1"
  local port="${MLX_PORT:-8080}"
  echo ""
  info "Starting OpenAI-compatible API server..."
  echo ""
  echo -e "${BOLD}  Model:${RESET}    $model"
  echo -e "${BOLD}  Endpoint:${RESET}  http://localhost:${port}/v1/chat/completions"
  echo ""
  echo -e "${DIM}  ─────────────────────────────────────────${RESET}"
  echo -e "${BOLD}  VS Code Copilot configuration:${RESET}"
  echo ""
  echo -e "  Add to your ${CYAN}settings.json${RESET}:"
  echo ""
  echo -e "  ${DIM}{${RESET}"
  echo -e "  ${DIM}  \"github.copilot.chat.models\": [{${RESET}"
  echo -e "  ${DIM}    \"id\": \"mlx-local\",${RESET}"
  echo -e "  ${DIM}    \"family\": \"mlx-local\",${RESET}"
  echo -e "  ${DIM}    \"name\": \"MLX Local (${model##*/})\",${RESET}"
  echo -e "  ${DIM}    \"url\": \"http://localhost:${port}/v1/chat/completions\",${RESET}"
  echo -e "  ${DIM}    \"isDefault\": false,${RESET}"
  echo -e "  ${DIM}    \"sendHeaders\": {}${RESET}"
  echo -e "  ${DIM}  }]${RESET}"
  echo -e "  ${DIM}}${RESET}"
  echo ""
  echo -e "${DIM}  ─────────────────────────────────────────${RESET}"
  echo -e "${DIM}  Press Ctrl+C to stop the server.${RESET}"
  echo ""

  python3 -m mlx_lm server \
    --model "$model" \
    --port "$port"
}

# ── Main ────────────────────────────────────────────────────────────────────

main() {
  header
  ensure_deps
  echo ""
  show_menu
  echo ""
  choose_mode

  case "$RUN_MODE" in
    chat)   run_chat "$SELECTED_MODEL" ;;
    server) run_server "$SELECTED_MODEL" ;;
  esac
}

main "$@"
