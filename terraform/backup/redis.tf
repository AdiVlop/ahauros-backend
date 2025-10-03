# ElastiCache Redis Configuration

# Redis Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.project_name}-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${local.project_name}-redis-subnet-group"
  }
}

# Redis Parameter Group
resource "aws_elasticache_parameter_group" "main" {
  family = "redis6.x"
  name   = "${local.project_name}-redis-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "timeout"
    value = "300"
  }

  tags = {
    Name = "${local.project_name}-redis-params"
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${local.project_name}-redis-${random_id.bucket_suffix.hex}"
  description                = "Redis cluster for Ahauros Backend"

  # Node configuration
  node_type                  = var.redis_node_type
  port                       = 6379
  parameter_group_name       = aws_elasticache_parameter_group.main.name
  engine_version             = "6.2"

  # Cluster configuration
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true

  # Network configuration
  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  # Backup configuration
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"

  # Maintenance
  maintenance_window = "sun:05:00-sun:07:00"

  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  # Logging
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }

  tags = {
    Name = "${local.project_name}-redis"
  }
}

# CloudWatch Log Group for Redis
resource "aws_cloudwatch_log_group" "redis" {
  name              = "/aws/elasticache/redis/${local.project_name}"
  retention_in_days = 7

  tags = {
    Name = "${local.project_name}-redis-logs"
  }
}



# Redis Subnet Group
