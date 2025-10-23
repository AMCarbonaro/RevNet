# Monitoring and Alerting Configuration for Revolution Network

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "Revolution-Network-Dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix],
            [".", "TargetResponseTime", ".", "."],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.primary_region
          title   = "Application Load Balancer Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", aws_ecs_service.main.name, "ClusterName", aws_ecs_cluster.main.name],
            [".", "MemoryUtilization", ".", ".", ".", "."],
            [".", "RunningTaskCount", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.primary_region
          title   = "ECS Service Metrics"
          period  = 300
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 12
        width  = 24
        height = 6

        properties = {
          query   = "SOURCE '${aws_cloudwatch_log_group.main.name}' | fields @timestamp, @message | sort @timestamp desc | limit 100"
          region  = var.primary_region
          title   = "Application Logs"
          view    = "table"
        }
      }
    ]
  })

  tags = local.common_tags
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_cpu_utilization" {
  count = var.alerts_enabled ? 1 : 0

  alarm_name          = "revolution-network-high-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS CPU utilization"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions = {
    ServiceName = aws_ecs_service.main.name
    ClusterName = aws_ecs_cluster.main.name
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "high_memory_utilization" {
  count = var.alerts_enabled ? 1 : 0

  alarm_name          = "revolution-network-high-memory-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "This metric monitors ECS memory utilization"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions = {
    ServiceName = aws_ecs_service.main.name
    ClusterName = aws_ecs_cluster.main.name
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "high_response_time" {
  count = var.alerts_enabled ? 1 : 0

  alarm_name          = "revolution-network-high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = "2"
  alarm_description   = "This metric monitors ALB response time"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  count = var.alerts_enabled ? 1 : 0

  alarm_name          = "revolution-network-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors ALB 5XX error count"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "low_healthy_hosts" {
  count = var.alerts_enabled ? 1 : 0

  alarm_name          = "revolution-network-low-healthy-hosts"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "This metric monitors healthy host count"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions = {
    TargetGroup  = aws_lb_target_group.main.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = local.common_tags
}

# SNS Topic for notifications
resource "aws_sns_topic" "alerts" {
  count = var.alerts_enabled ? 1 : 0

  name = "revolution-network-alerts"

  tags = local.common_tags
}

resource "aws_sns_topic_subscription" "email" {
  count = var.alerts_enabled && var.notification_email != "" ? 1 : 0

  topic_arn = aws_sns_topic.alerts[0].arn
  protocol  = "email"
  endpoint  = var.notification_email
}

resource "aws_sns_topic_subscription" "slack" {
  count = var.alerts_enabled && var.slack_webhook_url != "" ? 1 : 0

  topic_arn = aws_sns_topic.alerts[0].arn
  protocol  = "https"
  endpoint  = var.slack_webhook_url
}

# CloudWatch Log Insights Queries
resource "aws_cloudwatch_query_definition" "error_analysis" {
  count = var.monitoring_enabled ? 1 : 0

  name = "revolution-network-error-analysis"

  log_group_names = [
    aws_cloudwatch_log_group.main.name
  ]

  query_string = <<EOF
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
EOF
}

resource "aws_cloudwatch_query_definition" "performance_analysis" {
  count = var.monitoring_enabled ? 1 : 0

  name = "revolution-network-performance-analysis"

  log_group_names = [
    aws_cloudwatch_log_group.main.name
  ]

  query_string = <<EOF
fields @timestamp, @message
| filter @message like /response_time/
| stats avg(response_time) by bin(5m)
EOF
}

# X-Ray Tracing (if enabled)
resource "aws_xray_sampling_rule" "main" {
  count = var.monitoring_enabled ? 1 : 0

  rule_name      = "revolution-network-sampling-rule"
  priority       = 10000
  version        = 1
  reservoir_size = 1
  fixed_rate     = 0.1
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "*"
  resource_arn   = "*"

  tags = local.common_tags
}

# Custom Metrics
resource "aws_cloudwatch_log_metric_filter" "error_count" {
  count = var.monitoring_enabled ? 1 : 0

  name           = "revolution-network-error-count"
  log_group_name = aws_cloudwatch_log_group.main.name

  filter_pattern = "[timestamp, request_id, level=ERROR, ...]"

  metric_transformation {
    name      = "ErrorCount"
    namespace = "RevolutionNetwork/Application"
    value     = "1"
  }
}

resource "aws_cloudwatch_log_metric_filter" "request_count" {
  count = var.monitoring_enabled ? 1 : 0

  name           = "revolution-network-request-count"
  log_group_name = aws_cloudwatch_log_group.main.name

  filter_pattern = "[timestamp, request_id, method, url, status_code, ...]"

  metric_transformation {
    name      = "RequestCount"
    namespace = "RevolutionNetwork/Application"
    value     = "1"
  }
}

# CloudWatch Alarms for custom metrics
resource "aws_cloudwatch_metric_alarm" "high_error_rate_custom" {
  count = var.alerts_enabled && var.monitoring_enabled ? 1 : 0

  alarm_name          = "revolution-network-high-error-rate-custom"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorCount"
  namespace           = "RevolutionNetwork/Application"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors application error count"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  tags = local.common_tags
}

# Cost monitoring
resource "aws_budgets_budget" "monthly" {
  count = var.cost_optimization ? 1 : 0

  name         = "revolution-network-monthly-budget"
  budget_type  = "COST"
  limit_amount = "500"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"

  cost_filters = {
    Tag = [
      "Project:Revolution-Network"
    ]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.notification_email != "" ? [var.notification_email] : []
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "FORECASTED"
    subscriber_email_addresses = var.notification_email != "" ? [var.notification_email] : []
  }
}

# Performance monitoring
resource "aws_cloudwatch_metric_alarm" "low_request_count" {
  count = var.alerts_enabled && var.monitoring_enabled ? 1 : 0

  alarm_name          = "revolution-network-low-request-count"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "RequestCount"
  namespace           = "RevolutionNetwork/Application"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors low request count"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  tags = local.common_tags
}
