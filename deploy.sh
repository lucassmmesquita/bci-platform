#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  BCI Ventures — Deploy & Management Script
#  Uso: ./deploy.sh
# ═══════════════════════════════════════════════════════════════

set -e

# ── Cores ─────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Paths ─────────────────────────────────────────────────────
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
DIST_DIR="$FRONTEND_DIR/dist"

# ── FTP Config ────────────────────────────────────────────────
FTP_HOST="srv36.prodns.com.br"
FTP_USER="bci"
FTP_PASS='85s5|#CRA)eb'
FTP_TARGET="/public_html/admin"

# ── URLs ──────────────────────────────────────────────────────
ADMIN_URL="https://bciventures.com.br/admin/"
API_URL="https://bci-ventures-api.onrender.com"
GITHUB_URL="https://github.com/lucassmmesquita/bci-platform"

# ═══════════════════════════════════════════════════════════════
header() {
    clear
    echo -e "${BLUE}${BOLD}"
    echo "  ╔══════════════════════════════════════════════╗"
    echo "  ║        BCI Ventures — Deploy Manager        ║"
    echo "  ╚══════════════════════════════════════════════╝"
    echo -e "${NC}"
}

separator() {
    echo -e "${BLUE}  ──────────────────────────────────────────────${NC}"
}

success() { echo -e "  ${GREEN}✅ $1${NC}"; }
info()    { echo -e "  ${CYAN}ℹ️  $1${NC}"; }
warn()    { echo -e "  ${YELLOW}⚠️  $1${NC}"; }
error()   { echo -e "  ${RED}❌ $1${NC}"; }

# ═══════════════════════════════════════════════════════════════
#  1. Git: Commit & Push
# ═══════════════════════════════════════════════════════════════
git_commit_push() {
    header
    echo -e "  ${PURPLE}${BOLD}📦 Git — Commit & Push${NC}\n"

    cd "$ROOT_DIR"

    # Mostrar status
    echo -e "  ${CYAN}Arquivos modificados:${NC}"
    git status --short
    echo ""

    CHANGED=$(git status --porcelain | wc -l | tr -d ' ')
    if [ "$CHANGED" -eq "0" ]; then
        warn "Nenhuma alteração para commitar."
        read -p "  Pressione Enter para voltar..." _
        return
    fi

    # Pedir mensagem de commit
    echo -e "  ${YELLOW}Mensagens sugeridas:${NC}"
    echo "    1) feat: nova funcionalidade"
    echo "    2) fix: correção de bug"
    echo "    3) refactor: refatoração"
    echo "    4) docs: documentação"
    echo "    5) style: ajustes visuais"
    echo "    6) Digitar manualmente"
    echo ""
    read -p "  Escolha [1-6]: " MSG_OPT

    case $MSG_OPT in
        1) PREFIX="feat: " ;;
        2) PREFIX="fix: " ;;
        3) PREFIX="refactor: " ;;
        4) PREFIX="docs: " ;;
        5) PREFIX="style: " ;;
        *) PREFIX="" ;;
    esac

    read -p "  Mensagem do commit: ${PREFIX}" MSG
    FULL_MSG="${PREFIX}${MSG}"

    if [ -z "$FULL_MSG" ]; then
        error "Mensagem vazia. Cancelado."
        read -p "  Pressione Enter para voltar..." _
        return
    fi

    separator
    info "Adicionando arquivos..."
    git add -A

    info "Commitando: $FULL_MSG"
    git commit -m "$FULL_MSG"

    info "Enviando para GitHub..."
    git push origin main

    separator
    success "Push realizado com sucesso!"
    echo -e "  🔗 ${GITHUB_URL}"
    echo ""
    read -p "  Pressione Enter para voltar..." _
}

# ═══════════════════════════════════════════════════════════════
#  2. Frontend: Build + Deploy FTP
# ═══════════════════════════════════════════════════════════════
deploy_frontend() {
    header
    echo -e "  ${PURPLE}${BOLD}🚀 Frontend — Build & Deploy FTP${NC}\n"

    cd "$FRONTEND_DIR"

    # Build
    info "Executando build de produção..."
    separator
    npm run build
    separator

    if [ ! -f "$DIST_DIR/index.html" ]; then
        error "Build falhou! index.html não encontrado."
        read -p "  Pressione Enter para voltar..." _
        return
    fi

    success "Build concluído!"
    echo ""
    echo -e "  ${CYAN}Arquivos gerados:${NC}"
    du -sh "$DIST_DIR"/* 2>/dev/null | sed 's|.*/dist/|    |'
    echo ""

    read -p "  Enviar para FTP em $FTP_TARGET? [s/N]: " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[sS]$ ]]; then
        warn "Deploy cancelado."
        read -p "  Pressione Enter para voltar..." _
        return
    fi

    separator
    info "Conectando ao FTP: $FTP_HOST..."

    # Upload via Python (mais robusto que lftp)
    python3 "$ROOT_DIR/deploy_frontend.py"

    separator
    success "Frontend deployed!"
    echo -e "  🌐 ${ADMIN_URL}"
    echo ""
    read -p "  Pressione Enter para voltar..." _
}

# ═══════════════════════════════════════════════════════════════
#  3. Backend: Testar local
# ═══════════════════════════════════════════════════════════════
backend_local() {
    header
    echo -e "  ${PURPLE}${BOLD}🖥️  Backend — Servidor Local${NC}\n"

    cd "$BACKEND_DIR"

    if [ ! -d "venv" ]; then
        warn "venv não encontrado. Criando..."
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi

    info "Iniciando uvicorn em http://localhost:8000"
    info "Swagger: http://localhost:8000/api/docs"
    info "Ctrl+C para parar"
    separator
    uvicorn app.main:app --reload --port 8000
}

# ═══════════════════════════════════════════════════════════════
#  4. Frontend: Dev server
# ═══════════════════════════════════════════════════════════════
frontend_dev() {
    header
    echo -e "  ${PURPLE}${BOLD}💻 Frontend — Dev Server${NC}\n"

    cd "$FRONTEND_DIR"
    info "Iniciando Vite em http://localhost:5173"
    info "Ctrl+C para parar"
    separator
    npm run dev
}

# ═══════════════════════════════════════════════════════════════
#  5. Status: Health checks
# ═══════════════════════════════════════════════════════════════
check_status() {
    header
    echo -e "  ${PURPLE}${BOLD}🔍 Status dos Serviços${NC}\n"

    # Git status
    echo -e "  ${BOLD}📦 Git${NC}"
    cd "$ROOT_DIR"
    BRANCH=$(git branch --show-current 2>/dev/null || echo "N/A")
    PENDING=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    LAST_COMMIT=$(git log -1 --format="%h %s" 2>/dev/null || echo "N/A")
    echo "     Branch: $BRANCH"
    echo "     Pendentes: $PENDING arquivo(s)"
    echo "     Último commit: $LAST_COMMIT"
    echo ""

    # Backend local
    echo -e "  ${BOLD}🖥️  Backend Local${NC}"
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        HEALTH=$(curl -s http://localhost:8000/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','?'))" 2>/dev/null)
        success "Online (status: $HEALTH)"
    else
        warn "Offline"
    fi
    echo ""

    # PHP Bridge
    echo -e "  ${BOLD}🌐 PHP Bridge${NC}"
    BRIDGE=$(curl -s --max-time 10 "https://bciventures.com.br/api_bridge.php?action=health" 2>/dev/null)
    if echo "$BRIDGE" | grep -q "connected" 2>/dev/null; then
        DB_NAME=$(echo "$BRIDGE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('database','?'))" 2>/dev/null)
        success "Conectado (db: $DB_NAME)"
    else
        warn "Inacessível"
    fi
    echo ""

    # Render API
    echo -e "  ${BOLD}☁️  Render API${NC}"
    RENDER=$(curl -s --max-time 10 "$API_URL/health" 2>/dev/null)
    if echo "$RENDER" | grep -q "healthy" 2>/dev/null; then
        success "Online"
    else
        warn "Offline ou não deployado ainda"
    fi
    echo ""

    # Admin frontend
    echo -e "  ${BOLD}🌍 Frontend (Produção)${NC}"
    ADMIN=$(curl -s --max-time 10 -o /dev/null -w "%{http_code}" "$ADMIN_URL" 2>/dev/null)
    if [ "$ADMIN" = "200" ]; then
        success "Online ($ADMIN_URL)"
    else
        warn "HTTP $ADMIN"
    fi
    echo ""

    read -p "  Pressione Enter para voltar..." _
}

# ═══════════════════════════════════════════════════════════════
#  6. Full deploy (git + frontend)
# ═══════════════════════════════════════════════════════════════
full_deploy() {
    header
    echo -e "  ${PURPLE}${BOLD}🚀 Deploy Completo (Git + Frontend)${NC}\n"

    cd "$ROOT_DIR"
    CHANGED=$(git status --porcelain | wc -l | tr -d ' ')

    if [ "$CHANGED" -eq "0" ]; then
        warn "Nenhuma alteração no git."
    else
        echo -e "  ${CYAN}$CHANGED arquivo(s) modificado(s)${NC}"
        git status --short
        echo ""
        read -p "  Mensagem do commit: " MSG
        if [ -z "$MSG" ]; then
            error "Mensagem vazia. Cancelado."
            read -p "  Pressione Enter para voltar..." _
            return
        fi
        git add -A && git commit -m "$MSG" && git push origin main
        success "Git push concluído!"
    fi

    separator
    info "Iniciando build do frontend..."
    cd "$FRONTEND_DIR"
    npm run build

    if [ ! -f "$DIST_DIR/index.html" ]; then
        error "Build falhou!"
        read -p "  Pressione Enter para voltar..." _
        return
    fi

    info "Enviando para FTP..."
    cd "$ROOT_DIR"
    python3 deploy_frontend.py

    separator
    success "Deploy completo finalizado!"
    echo -e "  🔗 GitHub: ${GITHUB_URL}"
    echo -e "  🌐 Admin:  ${ADMIN_URL}"
    echo ""
    read -p "  Pressione Enter para voltar..." _
}

# ═══════════════════════════════════════════════════════════════
#  7. Atualizar PHP Bridge
# ═══════════════════════════════════════════════════════════════
update_bridge() {
    header
    echo -e "  ${PURPLE}${BOLD}🔄 Atualizar PHP Bridge no servidor${NC}\n"

    BRIDGE_FILE="$BACKEND_DIR/api_bridge.php"
    if [ ! -f "$BRIDGE_FILE" ]; then
        error "api_bridge.php não encontrado em $BACKEND_DIR"
        read -p "  Pressione Enter para voltar..." _
        return
    fi

    info "Enviando api_bridge.php via FTP..."

    python3 -c "
import ftplib
ftp = ftplib.FTP()
ftp.connect('$FTP_HOST', 21)
ftp.login('$FTP_USER', '$FTP_PASS')
ftp.set_pasv(True)
with open('$BRIDGE_FILE', 'rb') as f:
    ftp.storbinary('STOR /public_html/api_bridge.php', f)
ftp.quit()
print('OK')
"

    separator
    success "api_bridge.php atualizado no servidor!"

    # Teste
    info "Testando conexão..."
    RESULT=$(curl -s --max-time 10 "https://bciventures.com.br/api_bridge.php?action=health")
    echo "  $RESULT"
    echo ""
    read -p "  Pressione Enter para voltar..." _
}

# ═══════════════════════════════════════════════════════════════
#  Menu Principal
# ═══════════════════════════════════════════════════════════════
while true; do
    header
    echo -e "  ${BOLD}Escolha uma opção:${NC}\n"
    echo -e "  ${CYAN}1)${NC}  📦  Git — Commit & Push"
    echo -e "  ${CYAN}2)${NC}  🚀  Frontend — Build & Deploy FTP"
    echo -e "  ${CYAN}3)${NC}  🎯  Deploy Completo (Git + Frontend)"
    echo ""
    separator
    echo ""
    echo -e "  ${CYAN}4)${NC}  🖥️   Backend — Iniciar local"
    echo -e "  ${CYAN}5)${NC}  💻  Frontend — Dev server"
    echo ""
    separator
    echo ""
    echo -e "  ${CYAN}6)${NC}  🔍  Status dos serviços"
    echo -e "  ${CYAN}7)${NC}  🔄  Atualizar PHP Bridge"
    echo ""
    separator
    echo ""
    echo -e "  ${CYAN}0)${NC}  🚪  Sair"
    echo ""
    read -p "  → Opção: " OPT

    case $OPT in
        1) git_commit_push ;;
        2) deploy_frontend ;;
        3) full_deploy ;;
        4) backend_local ;;
        5) frontend_dev ;;
        6) check_status ;;
        7) update_bridge ;;
        0) echo -e "\n  ${GREEN}Até logo! 👋${NC}\n"; exit 0 ;;
        *) warn "Opção inválida." ; sleep 1 ;;
    esac
done
