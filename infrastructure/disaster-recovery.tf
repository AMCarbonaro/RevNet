# Disaster Recovery and Backup Configuration for Revolution Network

# Cross-region backup for critical data
resource "aws_s3_bucket" "backup" {
  bucket = "revolution-network-backup-${random_string.backup_suffix.result}"

  tags = merge(local.common_tags, {
    Name = "Revolution Network Backup"
    Type = "Backup"
  })
}

resource "random_string" "backup_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket_versioning" "backup" {
  bucket = aws_s3_bucket.backup.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "backup" {
  bucket = aws_s3_bucket.backup.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backup" {
  bucket = aws_s3_bucket.backup.id

  rule {
    id     = "backup_lifecycle"
    status = "Enabled"

    expiration {
      days = var.backup_retention_days
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
  }
}

# Cross-region replication for backup bucket
resource "aws_s3_bucket_replication_configuration" "backup" {
  count = var.multi_az ? 1 : 0

  role   = aws_iam_role.replication[0].arn
  bucket = aws_s3_bucket.backup.id

  rule {
    id     = "cross_region_replication"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.backup_replica[0].arn
      storage_class = "STANDARD_IA"

      encryption_configuration {
        replica_kms_key_id = aws_kms_key.replica[0].arn
      }
    }
  }

  depends_on = [aws_s3_bucket_versioning.backup]
}

# Replica bucket in secondary region
resource "aws_s3_bucket" "backup_replica" {
  count = var.multi_az ? 1 : 0

  provider = aws.secondary
  bucket   = "revolution-network-backup-replica-${random_string.backup_suffix.result}"

  tags = merge(local.common_tags, {
    Name = "Revolution Network Backup Replica"
    Type = "Backup"
  })
}

# IAM role for S3 replication
resource "aws_iam_role" "replication" {
  count = var.multi_az ? 1 : 0

  name = "revolution-network-s3-replication-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "replication" {
  count = var.multi_az ? 1 : 0

  name = "revolution-network-s3-replication-policy"
  role = aws_iam_role.replication[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetReplicationConfiguration",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.backup.arn,
          "${aws_s3_bucket.backup.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObjectVersionForReplication",
          "s3:GetObjectVersionAcl",
          "s3:GetObjectVersionTagging"
        ]
        Resource = "${aws_s3_bucket.backup.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ReplicateObject",
          "s3:ReplicateDelete",
          "s3:ReplicateTags"
        ]
        Resource = "${aws_s3_bucket.backup_replica[0].arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = aws_kms_key.main.arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Encrypt"
        ]
        Resource = aws_kms_key.replica[0].arn
      }
    ]
  })
}

# KMS keys for encryption
resource "aws_kms_key" "main" {
  description             = "KMS key for Revolution Network primary region"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = local.common_tags
}

resource "aws_kms_key" "replica" {
  count = var.multi_az ? 1 : 0

  provider                = aws.secondary
  description             = "KMS key for Revolution Network secondary region"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = local.common_tags
}

# Automated backup using AWS Backup
resource "aws_backup_vault" "main" {
  name        = "revolution-network-backup-vault"
  kms_key_arn = aws_kms_key.main.arn

  tags = local.common_tags
}

resource "aws_backup_plan" "main" {
  name = "revolution-network-backup-plan"

  rule {
    rule_name         = "daily_backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 2 * * ? *)"

    lifecycle {
      cold_storage_after = 30
      delete_after       = 90
    }

    recovery_point_tags = local.common_tags
  }

  rule {
    rule_name         = "weekly_backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 3 ? * SUN *)"

    lifecycle {
      cold_storage_after = 7
      delete_after       = 365
    }

    recovery_point_tags = local.common_tags
  }

  tags = local.common_tags
}

resource "aws_backup_selection" "main" {
  iam_role_arn = aws_iam_role.backup[0].arn
  name         = "revolution-network-backup-selection"
  plan_id      = aws_backup_plan.main.id

  resources = [
    aws_s3_bucket.backup.arn,
    aws_cloudwatch_log_group.main.arn
  ]

  condition {
    string_equals {
      key   = "aws:ResourceTag/Project"
      value = "Revolution-Network"
    }
  }
}

resource "aws_iam_role" "backup" {
  count = var.multi_az ? 1 : 0

  name = "revolution-network-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "backup" {
  count = var.multi_az ? 1 : 0

  role       = aws_iam_role.backup[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

# Route 53 health checks for failover
resource "aws_route53_health_check" "main" {
  count = var.multi_az ? 1 : 0

  fqdn              = aws_lb.main.dns_name
  port              = 443
  type              = "HTTPS"
  resource_path     = var.health_check_path
  failure_threshold = "3"
  request_interval  = "30"

  tags = local.common_tags
}

# Route 53 record with failover
resource "aws_route53_record" "failover" {
  count = var.multi_az ? 1 : 0

  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = "failover.${var.domain_name}"
  type    = "A"

  failover_routing_policy {
    type = "PRIMARY"
  }

  health_check_id = aws_route53_health_check.main[0].id

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# CloudWatch alarms for disaster recovery
resource "aws_cloudwatch_metric_alarm" "disaster_recovery" {
  count = var.alerts_enabled && var.multi_az ? 1 : 0

  alarm_name          = "revolution-network-disaster-recovery"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = "0"
  alarm_description   = "This metric monitors for disaster recovery scenarios"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions = {
    TargetGroup  = aws_lb_target_group.main.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = local.common_tags
}

# Lambda function for automated disaster recovery
resource "aws_lambda_function" "disaster_recovery" {
  count = var.multi_az ? 1 : 0

  filename         = "disaster_recovery.zip"
  function_name    = "revolution-network-disaster-recovery"
  role            = aws_iam_role.lambda_disaster_recovery[0].arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 300

  environment {
    variables = {
      PRIMARY_REGION   = var.primary_region
      SECONDARY_REGION = var.secondary_region
      SNS_TOPIC_ARN    = var.sns_topic_arn
    }
  }

  tags = local.common_tags
}

resource "aws_iam_role" "lambda_disaster_recovery" {
  count = var.multi_az ? 1 : 0

  name = "revolution-network-lambda-disaster-recovery-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "lambda_disaster_recovery" {
  count = var.multi_az ? 1 : 0

  name = "revolution-network-lambda-disaster-recovery-policy"
  role = aws_iam_role.lambda_disaster_recovery[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:ListServices"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = var.sns_topic_arn
      }
    ]
  })
}

# EventBridge rule to trigger disaster recovery
resource "aws_cloudwatch_event_rule" "disaster_recovery" {
  count = var.multi_az ? 1 : 0

  name        = "revolution-network-disaster-recovery"
  description = "Trigger disaster recovery when health check fails"

  event_pattern = jsonencode({
    source      = ["aws.route53"]
    detail-type = ["Route 53 Health Check Status Change"]
    detail = {
      "HealthCheckId" = [aws_route53_health_check.main[0].id]
      "HealthCheckStatus" = ["Unhealthy"]
    }
  })

  tags = local.common_tags
}

resource "aws_cloudwatch_event_target" "disaster_recovery" {
  count = var.multi_az ? 1 : 0

  rule      = aws_cloudwatch_event_rule.disaster_recovery[0].name
  target_id = "TriggerDisasterRecovery"
  arn       = aws_lambda_function.disaster_recovery[0].arn
}

resource "aws_lambda_permission" "disaster_recovery" {
  count = var.multi_az ? 1 : 0

  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.disaster_recovery[0].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.disaster_recovery[0].arn
}

# RDS read replica in secondary region (if using RDS)
resource "aws_db_instance" "read_replica" {
  count = var.multi_az ? 1 : 0

  provider = aws.secondary

  identifier = "revolution-network-read-replica"

  replicate_source_db = aws_db_instance.main[0].identifier

  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp2"
  storage_encrypted = var.encryption_at_rest

  backup_retention_period = var.backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true

  tags = local.common_tags
}

# Main RDS instance (if using RDS)
resource "aws_db_instance" "main" {
  count = var.multi_az ? 1 : 0

  identifier = "revolution-network-main"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = var.encryption_at_rest

  db_name  = "revolutionnetwork"
  username = "revolutionnetwork"
  password = random_password.db_password[0].result

  vpc_security_group_ids = [aws_security_group.rds[0].id]
  db_subnet_group_name   = aws_db_subnet_group.main[0].name

  backup_retention_period = var.backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true

  tags = local.common_tags
}

resource "aws_db_subnet_group" "main" {
  count = var.multi_az ? 1 : 0

  name       = "revolution-network-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "Revolution Network DB subnet group"
  })
}

resource "aws_security_group" "rds" {
  count = var.multi_az ? 1 : 0

  name_prefix = "revolution-network-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "revolution-network-rds-sg"
  })
}

resource "random_password" "db_password" {
  count = var.multi_az ? 1 : 0

  length  = 16
  special = true
}

# Store database password in SSM
resource "aws_ssm_parameter" "db_password" {
  count = var.multi_az ? 1 : 0

  name  = "/revolution-network/db-password"
  type  = "SecureString"
  value = random_password.db_password[0].result

  tags = local.common_tags
}
