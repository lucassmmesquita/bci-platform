"""
Script para fazer upload do frontend build para o FTP.
Envia o conteúdo de frontend/dist/ para /public_html/admin/ no servidor.
"""
import ftplib
import os
import sys

FTP_HOST = "srv36.prodns.com.br"
FTP_PORT = 21
FTP_USER = "bci"
FTP_PASSWORD = "85s5|#CRA)eb"
FTP_TARGET = "/public_html/admin"
LOCAL_DIR = os.path.join(os.path.dirname(__file__), "frontend", "dist")


def ensure_dir(ftp, path):
    """Cria diretório remoto se não existir."""
    try:
        ftp.cwd(path)
    except ftplib.error_perm:
        parent = os.path.dirname(path)
        if parent and parent != path:
            ensure_dir(ftp, parent)
        print(f"  📁 Criando: {path}")
        ftp.mkd(path)
        ftp.cwd(path)


def upload_dir(ftp, local_path, remote_path):
    """Upload recursivo de diretório local para remoto."""
    ensure_dir(ftp, remote_path)
    for item in os.listdir(local_path):
        local_item = os.path.join(local_path, item)
        remote_item = f"{remote_path}/{item}"
        if os.path.isdir(local_item):
            upload_dir(ftp, local_item, remote_item)
        else:
            size = os.path.getsize(local_item)
            print(f"  📤 {remote_item} ({size:,} bytes)")
            with open(local_item, "rb") as f:
                ftp.storbinary(f"STOR {remote_item}", f)


def main():
    print(f"🔗 Conectando ao FTP: {FTP_HOST}...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT)
    ftp.login(FTP_USER, FTP_PASSWORD)
    ftp.set_pasv(True)
    print(f"✅ Conectado!")

    print(f"\n📦 Enviando {LOCAL_DIR} → {FTP_TARGET}")
    upload_dir(ftp, LOCAL_DIR, FTP_TARGET)

    # Criar .htaccess para SPA routing
    htaccess_content = """RewriteEngine On
RewriteBase /admin/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
"""
    import io
    htaccess_path = f"{FTP_TARGET}/.htaccess"
    print(f"  📤 {htaccess_path} (SPA routing)")
    ftp.storbinary(f"STOR {htaccess_path}", io.BytesIO(htaccess_content.encode()))

    ftp.quit()
    print(f"\n🎉 Deploy concluído! Acesse: https://bciventures.com.br/admin/")


if __name__ == "__main__":
    main()
