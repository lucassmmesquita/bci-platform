# Scoring Algorithm — BCI Ventures Platform

## 1. Visão Geral

O algoritmo de score avalia startups e seus projetos cadastrados no site da BCI, gerando uma pontuação multidimensional (0–1000) que apoia decisões estratégicas do time de inovação. A plataforma consome os dados já cadastrados pelas startups e aplica o motor de avaliação automaticamente.

### Princípios
- **Objetividade:** Critérios mensuráveis e padronizados
- **Transparência:** Justificativa textual para cada dimensão
- **Reprodutibilidade:** Mesmo input = mesmo output
- **Configurabilidade:** Pesos ajustáveis pelo admin sem alterar código
- **Explicabilidade:** Tomadores de decisão entendem o porquê do score

---

## 2. Dimensões de Avaliação

| # | Dimensão | Peso | Descrição |
|---|----------|------|-----------|
| 1 | Inovação | 12% | Grau de novidade, PI, originalidade |
| 2 | Mercado | 15% | TAM/SAM/SOM, tendências, timing |
| 3 | Tração | 13% | Faturamento, crescimento, clientes |
| 4 | Equipe | 12% | Experiência, tamanho, dedicação |
| 5 | Tecnologia | 10% | Maturidade, stack, escalabilidade técnica |
| 6 | Modelo de Negócio | 10% | Recorrência, margens, unit economics |
| 7 | Finanças | 8% | Saúde financeira, valuation, captação |
| 8 | Competitividade | 8% | Barreiras, moat, diferencial |
| 9 | Impacto | 5% | ESG, social, ambiental, econômico |
| 10 | Risco | 7% | Operacional, tecnológico, regulatório |

**Total dos pesos: 100%**

---

## 3. Mapeamento de Campos → Critérios

### 3.1 Dimensão: Inovação (peso 12%)

| Critério | Campo CSV | Regra de Pontuação (0-100) |
|----------|-----------|---------------------------|
| Setor de atuação | `setorStartup` | Deeptech/BioTech=100, AI_ML/Blockchain=85, SaaS/IoT=70, outros=50 |
| Tipo de tecnologia | `tecnologia` | Proprietária (ia_ml, blockchain, biotech)=100, SaaS=70, Mobile=50 |
| Diferencial competitivo | `diferencial` | tecnologia_proprietaria=100, modelo_negocio=80, preco=40, outro=60 |

```python
def calc_inovacao(startup: dict) -> tuple[float, str]:
    setor_scores = {
        'deeptech': 100, 'biotech': 100, 'ai_ml': 85, 'blockchain': 85,
        'cybersecurity': 80, 'iot': 75, 'saas': 70, 'fintech': 70,
        'healthtech': 75, 'cleantech': 80, 'edtech': 60,
        'retailtech': 50, 'marketplace': 45, 'outro': 40
    }
    tech_scores = {
        'ia_ml': 100, 'blockchain': 95, 'biotech': 95, 'iot': 85,
        'hardware': 80, 'saas': 70, 'cloud': 65, 'mobile': 50
    }
    diff_scores = {
        'tecnologia_proprietaria': 100, 'modelo_negocio': 80,
        'rede_efeito': 75, 'dados_exclusivos': 85,
        'preco': 40, 'atendimento': 35, 'outro': 50
    }

    s1 = setor_scores.get(startup['setor'], 40)
    s2 = tech_scores.get(startup['tecnologia'], 50)
    s3 = diff_scores.get(startup['diferencial'], 50)

    score = s1 * 0.35 + s2 * 0.35 + s3 * 0.30
    justificativa = f"Setor {startup['setor']} ({s1}/100), tecnologia {startup['tecnologia']} ({s2}/100), diferencial {startup['diferencial']} ({s3}/100)"
    return round(score, 2), justificativa
```

### 3.2 Dimensão: Mercado (peso 15%)

| Critério | Campo CSV | Regra |
|----------|-----------|-------|
| TAM | `tam` | Escala ordinal das faixas de valor |
| SAM | `sam` | Escala ordinal |
| SOM | `som` | Escala ordinal |
| Público | `publico` | B2B=80, B2B2C=75, B2C=60, B2G=70 |

```python
MARKET_SIZE_SCORES = {
    'ate_100k': 10, '100k_500k': 20, '500k_1mi': 30,
    '1_5mi': 45, '5_10mi': 55, '10_50mi': 70,
    '50_100mi': 80, '100_200mi': 90, 'acima_200mi': 100,
    'ate_10mi': 55  # legacy format
}

def calc_mercado(startup: dict) -> tuple[float, str]:
    tam = MARKET_SIZE_SCORES.get(startup['tam'], 30)
    sam = MARKET_SIZE_SCORES.get(startup['sam'], 20)
    som = MARKET_SIZE_SCORES.get(startup['som'], 10)
    pub = {'b2b': 80, 'b2b2c': 75, 'b2g': 70, 'b2c': 60}.get(startup['publico'], 50)

    score = tam * 0.30 + sam * 0.25 + som * 0.25 + pub * 0.20
    justificativa = f"TAM={tam}, SAM={sam}, SOM={som}, público={startup['publico']}({pub})"
    return round(score, 2), justificativa
```

### 3.3 Dimensão: Tração (peso 13%)

| Critério | Campo CSV | Regra |
|----------|-----------|-------|
| Faturamento atual | `faturamento_atual` | Escala ordinal |
| Previsão de faturamento | `previsao_faturamento` | Escala ordinal |
| Canais de distribuição | `canais` | Quantidade × diversidade |
| Estágio | `estagio` | Ordinal de maturidade |

```python
REVENUE_SCORES = {
    'sem_faturamento': 0, 'ate_10k': 15, '10k_50k': 30,
    '50k_100k': 45, '100k_500k': 60, '500k_1mi': 75,
    '1mi_5mi': 85, '5mi_10mi': 92, 'acima_10mi': 100
}
STAGE_SCORES = {
    'ideacao': 15, 'pre_seed': 30, 'mvp_validado': 50,
    'tracao_inicial': 65, 'crescimento': 80, 'escala': 92, 'consolidado': 100
}

def calc_tracao(startup: dict) -> tuple[float, str]:
    faturamento = REVENUE_SCORES.get(startup['faturamento_atual'], 10)
    previsao = REVENUE_SCORES.get(startup['previsao_faturamento'], 10)
    estagio = STAGE_SCORES.get(startup['estagio'], 20)
    canais = min(len(startup.get('canais', [])) * 20, 100)

    score = faturamento * 0.35 + previsao * 0.20 + estagio * 0.30 + canais * 0.15
    return round(score, 2), f"Faturamento={faturamento}, Previsão={previsao}, Estágio={estagio}, Canais={canais}"
```

### 3.4 Dimensão: Equipe (peso 12%)

| Critério | Campo CSV | Regra |
|----------|-----------|-------|
| Número de integrantes | `numero_integrantes` | 1=20, 2-3=50, 4-6=75, 7+=90 |
| Dedicação | `nivel_envolvimento` | time_dedicado=100, squad_parcial=60, founders_only=40 |
| Parentesco | `vinculo_parentesco` | nao=100, sim=50 (risco de governança) |

```python
def calc_equipe(startup: dict) -> tuple[float, str]:
    n = startup.get('numero_integrantes', 1)
    if n >= 7: team_size = 90
    elif n >= 4: team_size = 75
    elif n >= 2: team_size = 50
    else: team_size = 20

    envolvimento = {'time_dedicado': 100, 'squad_parcial': 60, 'founders_only': 40}.get(
        startup.get('nivel_envolvimento', ''), 30)
    parentesco = 100 if startup.get('vinculo_parentesco') == 'nao' else 50

    score = team_size * 0.40 + envolvimento * 0.35 + parentesco * 0.25
    return round(score, 2), f"Integrantes={n}({team_size}), Envolvimento={envolvimento}, Parentesco={parentesco}"
```

### 3.5 Dimensão: Tecnologia (peso 10%)

```python
def calc_tecnologia(startup: dict) -> tuple[float, str]:
    tech = {'ia_ml': 95, 'blockchain': 90, 'biotech': 90, 'iot': 80,
            'hardware': 75, 'saas': 70, 'cloud': 65, 'mobile': 50}.get(
        startup['tecnologia'], 40)
    estagio = STAGE_SCORES.get(startup['estagio'], 20)  # maturidade técnica correlaciona
    mvp = 80 if startup.get('mvp_links') else 30

    score = tech * 0.40 + estagio * 0.30 + mvp * 0.30
    return round(score, 2), f"Tech={tech}, Maturidade={estagio}, MVP={'sim' if mvp>50 else 'não'}({mvp})"
```

### 3.6 Dimensão: Modelo de Negócio (peso 10%)

```python
def calc_modelo_negocio(startup: dict) -> tuple[float, str]:
    # SaaS e marketplace tendem a ter recorrência
    recorrencia = {'saas': 95, 'marketplace': 80, 'fintech': 85,
                   'retailtech': 60, 'deeptech': 50}.get(startup['setor'], 50)
    previsao = REVENUE_SCORES.get(startup['previsao_faturamento'], 20)
    publico = {'b2b': 85, 'b2b2c': 80, 'b2g': 70, 'b2c': 55}.get(startup['publico'], 50)

    score = recorrencia * 0.40 + previsao * 0.35 + publico * 0.25
    return round(score, 2), f"Recorrência={recorrencia}, Previsão={previsao}, Público={publico}"
```

### 3.7 Dimensão: Finanças (peso 8%)

```python
VALUATION_SCORES = {
    'nao_definido': 10, 'ate_500k': 20, '500k_1mi': 35,
    'ate_2mi': 45, '1_2mi': 45, '2_5mi': 60,
    '5_10mi': 75, '10_50mi': 85, 'acima_50mi': 95
}
INVESTMENT_SCORES = {
    '50k': 20, '100k': 30, '200k': 40, '500k': 55,
    '1mi': 70, '2mi': 80, '5mi': 90, 'acima_5mi': 95
}

def calc_financas(startup: dict) -> tuple[float, str]:
    valuation = VALUATION_SCORES.get(startup.get('valuation', ''), 20)
    investimento = INVESTMENT_SCORES.get(startup.get('investimento_desejado', ''), 30)
    captacao = 80 if startup.get('captacao_anterior') not in ('nao', 'NAO', None) else 30
    faturamento = REVENUE_SCORES.get(startup['faturamento_atual'], 10)

    score = faturamento * 0.30 + valuation * 0.25 + investimento * 0.20 + captacao * 0.25
    return round(score, 2), f"Faturamento={faturamento}, Valuation={valuation}, Captação={'sim' if captacao>50 else 'não'}"
```

### 3.8 Dimensão: Competitividade (peso 8%)

```python
def calc_competitividade(startup: dict) -> tuple[float, str]:
    diferencial = {'tecnologia_proprietaria': 100, 'dados_exclusivos': 90,
                   'rede_efeito': 85, 'modelo_negocio': 75,
                   'preco': 40, 'atendimento': 35}.get(startup['diferencial'], 50)
    # Análise textual simplificada dos concorrentes
    conc_text = startup.get('concorrentes', '')
    conc_detail = min(len(conc_text) * 0.5, 80)  # mais detalhes = melhor análise

    score = diferencial * 0.60 + conc_detail * 0.40
    return round(score, 2), f"Diferencial={diferencial}, Análise concorrencial={conc_detail:.0f}"
```

### 3.9 Dimensão: Impacto (peso 5%)

```python
def calc_impacto(startup: dict) -> tuple[float, str]:
    setor_impact = {
        'cleantech': 100, 'healthtech': 90, 'edtech': 85,
        'agritech': 80, 'social_impact': 100, 'govtech': 75,
        'fintech': 60, 'deeptech': 70
    }.get(startup['setor'], 40)
    publico_impact = {'b2g': 90, 'b2c': 70, 'b2b2c': 65, 'b2b': 50}.get(startup['publico'], 40)

    score = setor_impact * 0.60 + publico_impact * 0.40
    return round(score, 2), f"Impacto setorial={setor_impact}, Alcance público={publico_impact}"
```

### 3.10 Dimensão: Risco (peso 7%) — Invertida

> **Nota:** Nesta dimensão, score alto = BAIXO risco (favorável).

```python
def calc_risco(startup: dict) -> tuple[float, str]:
    # Estágio mais maduro = menos risco
    estagio_risk = {'consolidado': 95, 'escala': 85, 'crescimento': 70,
                    'tracao_inicial': 55, 'mvp_validado': 40,
                    'pre_seed': 25, 'ideacao': 10}.get(startup['estagio'], 20)
    juridica = 80 if startup.get('estrutura_juridica') not in (None, 'ainda_nao') else 30
    parentesco = 90 if startup.get('vinculo_parentesco') == 'nao' else 50

    # Riscos declarados (mais riscos = maior consciência, pontuação neutra)
    riscos_list = startup.get('riscos', [])
    if isinstance(riscos_list, str):
        riscos_list = [riscos_list]
    risco_awareness = min(len(riscos_list) * 25, 75) if riscos_list else 30

    score = estagio_risk * 0.40 + juridica * 0.25 + parentesco * 0.15 + risco_awareness * 0.20
    return round(score, 2), f"Maturidade={estagio_risk}, Jurídico={juridica}, Governança={parentesco}"
```

---

## 4. Cálculo do Score Final

```python
WEIGHTS = {
    'inovacao': 0.12, 'mercado': 0.15, 'tracao': 0.13,
    'equipe': 0.12, 'tecnologia': 0.10, 'modelo_negocio': 0.10,
    'financas': 0.08, 'competitividade': 0.08, 'impacto': 0.05, 'risco': 0.07,
}

def calculate_total_score(startup: dict) -> dict:
    dimensions = {
        'inovacao': calc_inovacao(startup),
        'mercado': calc_mercado(startup),
        'tracao': calc_tracao(startup),
        'equipe': calc_equipe(startup),
        'tecnologia': calc_tecnologia(startup),
        'modelo_negocio': calc_modelo_negocio(startup),
        'financas': calc_financas(startup),
        'competitividade': calc_competitividade(startup),
        'impacto': calc_impacto(startup),
        'risco': calc_risco(startup),
    }

    # Score ponderado (0-100 por dimensão × peso × 10 para escala 0-1000)
    total = sum(dimensions[d][0] * WEIGHTS[d] for d in dimensions) * 10
    total = round(min(total, 1000), 2)

    classification = classify(total)

    return {
        'total_score': total,
        'classification': classification,
        'dimensions': {d: {'score': dimensions[d][0], 'justificativa': dimensions[d][1]} for d in dimensions},
    }

def classify(score: float) -> str:
    if score >= 901: return 'S'
    if score >= 751: return 'A'
    if score >= 601: return 'B'
    if score >= 401: return 'C'
    if score >= 201: return 'D'
    return 'E'
```

---

## 5. Classificação e Significado

| Classe | Faixa | Significado | Ação Sugerida |
|--------|-------|-------------|---------------|
| **S** | 901–1000 | Excepcional | Prioridade máxima, fast-track para deal |
| **A** | 751–900 | Muito Forte | Avaliação profunda, potencial de investimento |
| **B** | 601–750 | Forte | Shortlist, acompanhamento próximo |
| **C** | 401–600 | Moderado | Programa de aceleração, mentoria |
| **D** | 201–400 | Fraco | Feedback ao fundador, reavaliação futura |
| **E** | 0–200 | Insuficiente | Rejeição com orientação |

---

## 6. Ranking e Desempate

```python
def build_ranking(startups: list[dict], filters: dict = None) -> list[dict]:
    """
    Ordenação:
    1. total_score (DESC)
    2. dim_inovacao (DESC) — desempate
    3. data_criacao (ASC) — mais antigo primeiro
    """
    ranked = sorted(startups, key=lambda s: (
        -s['total_score'],
        -s['dimensions']['inovacao']['score'],
        s['data_criacao']
    ))
    for i, s in enumerate(ranked):
        s['rank'] = i + 1
    return ranked
```

---

## 7. Override Manual

O analista pode ajustar o score de qualquer dimensão, desde que:
- Forneça justificativa textual (campo obrigatório)
- O ajuste é registrado no banco com flag `is_manual_override = True`
- O score original (algorítmico) é preservado para comparação
- Log de auditoria é criado automaticamente

---

## 8. Configuração Dinâmica de Pesos

```python
# Tabela scoring_configs (futuro)
# Permite ao admin ajustar pesos sem deploy
{
    "version": "v1.1",
    "weights": {
        "inovacao": 0.12,
        "mercado": 0.15,
        ...
    },
    "active": true,
    "created_by": "admin@bci.com",
    "created_at": "2025-09-01"
}
```

---

## 9. Aderência Estratégica (Módulo Futuro)

Score adicional para avaliar compatibilidade com diferentes tipos de deal:

| Tipo de Deal | Critérios Privilegiados |
|-------------|------------------------|
| Aquisição (M&A) | Tecnologia, PI, equipe, faturamento |
| Investimento (Equity) | Tração, mercado, crescimento |
| Fusão/Incorporação | Modelo de negócio, sinergia setorial |
| Parceria Estratégica | Complementaridade, canais, público |
| Inovação Aberta | Inovação, tecnologia, impacto |
