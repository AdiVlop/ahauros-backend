# PostgreSQL Configuration

Configurații și scripturi pentru baza de date PostgreSQL.

## Fișiere

- `init.sql` - Script de inițializare cu tabele de bază
- `migrations/` - Scripturi de migrare (viitor)
- `seeds/` - Date de test (viitor)

## Tabele

- `users` - Utilizatori sistem
- `products` - Produse și servicii
- `orders` - Comenzi și tranzacții

## Conectare

```bash
# Prin Docker
docker exec -it ahauros-postgres psql -U admin -d ahauros

# Prin client extern
psql -h localhost -p 5432 -U admin -d ahauros
```
