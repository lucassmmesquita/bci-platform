<?php
/**
 * BCI Ventures — PHP API Bridge
 * 
 * Endpoint PHP para expor dados do MySQL como JSON.
 * Este arquivo deve ser acessível via HTTP no servidor.
 * 
 * Endpoints:
 *   ?action=list         → Lista startups (com paginação e filtros)
 *   ?action=get&id=N     → Detalhe de uma startup
 *   ?action=stats        → Estatísticas resumidas
 *   ?action=health       → Health check do banco
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Configuração do banco ──────────────────────────────
$config = require __DIR__ . '/config.php';
$db_config = $config['database'];

try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['database']};charset={$db_config['charset']}";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'detail' => $e->getMessage()]);
    exit;
}

// ── Ação ────────────────────────────────────────────────
$action = $_GET['action'] ?? 'list';

switch ($action) {

    case 'health':
        echo json_encode([
            'status' => 'connected',
            'host' => $db_config['host'],
            'database' => $db_config['database'],
            'timestamp' => date('Y-m-d H:i:s'),
        ]);
        break;

    case 'stats':
        $stats = [];
        
        // Total
        $stmt = $pdo->query('SELECT COUNT(*) as total FROM formulario_startups_bci');
        $stats['total_startups'] = (int)$stmt->fetch()['total'];
        
        // Por status
        $stmt = $pdo->query('SELECT status, COUNT(*) as cnt FROM formulario_startups_bci GROUP BY status');
        $stats['by_status'] = [];
        while ($row = $stmt->fetch()) {
            if ($row['status']) {
                $stats['by_status'][$row['status']] = (int)$row['cnt'];
            }
        }
        
        // Por setor
        $stmt = $pdo->query('SELECT setorStartup, COUNT(*) as cnt FROM formulario_startups_bci GROUP BY setorStartup');
        $stats['by_setor'] = [];
        while ($row = $stmt->fetch()) {
            if ($row['setorStartup']) {
                $stats['by_setor'][$row['setorStartup']] = (int)$row['cnt'];
            }
        }
        
        // Por estágio
        $stmt = $pdo->query('SELECT estagio, COUNT(*) as cnt FROM formulario_startups_bci GROUP BY estagio');
        $stats['by_estagio'] = [];
        while ($row = $stmt->fetch()) {
            if ($row['estagio']) {
                $stats['by_estagio'][$row['estagio']] = (int)$row['cnt'];
            }
        }
        
        echo json_encode($stats);
        break;

    case 'get':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID inválido']);
            exit;
        }
        
        $stmt = $pdo->prepare('SELECT * FROM formulario_startups_bci WHERE id = ?');
        $stmt->execute([$id]);
        $startup = $stmt->fetch();
        
        if (!$startup) {
            http_response_code(404);
            echo json_encode(['error' => "Startup #{$id} não encontrada"]);
            exit;
        }
        
        echo json_encode($startup);
        break;

    case 'list':
    default:
        // Parâmetros de paginação
        $page = max(1, (int)($_GET['page'] ?? 1));
        $per_page = min(100, max(1, (int)($_GET['per_page'] ?? 20)));
        $offset = ($page - 1) * $per_page;
        
        // Filtros
        $where = [];
        $params = [];
        
        if (!empty($_GET['setor'])) {
            $where[] = 'setorStartup = ?';
            $params[] = $_GET['setor'];
        }
        if (!empty($_GET['estagio'])) {
            $where[] = 'estagio = ?';
            $params[] = $_GET['estagio'];
        }
        if (!empty($_GET['status'])) {
            $where[] = 'status = ?';
            $params[] = $_GET['status'];
        }
        if (!empty($_GET['cidade'])) {
            $where[] = 'cidade LIKE ?';
            $params[] = '%' . $_GET['cidade'] . '%';
        }
        if (!empty($_GET['search'])) {
            $where[] = '(nome_startup LIKE ? OR descricao LIKE ? OR nome LIKE ? OR email LIKE ?)';
            $search = '%' . $_GET['search'] . '%';
            $params = array_merge($params, [$search, $search, $search, $search]);
        }
        
        $where_clause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';
        
        // Ordenação
        $allowed_sort = ['data_criacao', 'nome_startup', 'setorStartup', 'estagio', 'status', 'id'];
        $sort_by = in_array($_GET['sort_by'] ?? '', $allowed_sort) ? $_GET['sort_by'] : 'data_criacao';
        $sort_order = strtolower($_GET['sort_order'] ?? 'desc') === 'asc' ? 'ASC' : 'DESC';
        
        // Total
        $count_sql = "SELECT COUNT(*) as total FROM formulario_startups_bci {$where_clause}";
        $stmt = $pdo->prepare($count_sql);
        $stmt->execute($params);
        $total = (int)$stmt->fetch()['total'];
        
        // Query paginada
        $sql = "SELECT * FROM formulario_startups_bci {$where_clause} ORDER BY {$sort_by} {$sort_order} LIMIT {$per_page} OFFSET {$offset}";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();
        
        echo json_encode([
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total / $per_page),
        ]);
        break;
}
