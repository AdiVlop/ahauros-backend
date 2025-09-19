# Data Layer

Stratul de date pentru sistemul Ahauros AI.

## Componente

- `postgres/` - Configurații și scripturi PostgreSQL
- `redis/` - Configurații Redis pentru cache
- `clickhouse/` - Configurații ClickHouse pentru analytics

## Baze de Date

- **PostgreSQL**: Date structurate, utilizatori, produse, comenzi
- **Redis**: Cache, sesiuni, cozi de mesaje
- **ClickHouse**: Analytics, metrici, date de performanță

## Configurare

Toate bazele de date sunt configurate prin Docker Compose și pornite automat.
