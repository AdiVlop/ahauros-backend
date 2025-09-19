# ClickHouse Configuration

Configurații pentru ClickHouse analytics database.

## Funcționalități

- Analytics în timp real
- Procesare date mari
- Metrici de performanță
- Rapoarte și dashboard-uri

## Configurare

ClickHouse rulează pe porturile 8123 (HTTP) și 9000 (Native).

## Conectare

```bash
# Prin Docker (HTTP)
docker exec -it ahauros-clickhouse clickhouse-client

# Prin client extern
clickhouse-client --host localhost --port 9000 --user admin --password secret123
```

## Comenzi Utile

```bash
# Verifică status
SELECT 1

# Listă baze de date
SHOW DATABASES

# Verifică tabele
SHOW TABLES
```

