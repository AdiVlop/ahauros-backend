# Redis Configuration

Configurații pentru Redis cache și message broker.

## Funcționalități

- Cache pentru aplicații
- Sesiuni utilizatori
- Cozi de mesaje
- Pub/Sub messaging

## Configurare

Redis este configurat cu persistență AOF activată pentru durabilitate.

## Conectare

```bash
# Prin Docker
docker exec -it ahauros-redis redis-cli

# Prin client extern
redis-cli -h localhost -p 6379
```

## Comenzi Utile

```bash
# Verifică status
PING

# Listă toate cheile
KEYS *

# Verifică memorie
INFO memory
```

