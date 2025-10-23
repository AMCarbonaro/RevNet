# Outputs for Revolution Network Infrastructure

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "target_group_arn" {
  description = "ARN of the target group"
  value       = aws_lb_target_group.main.arn
}

output "ecs_cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.main.name
}

output "ecs_service_id" {
  description = "ID of the ECS service"
  value       = aws_ecs_service.main.id
}

output "ecs_task_definition_arn" {
  description = "ARN of the ECS task definition"
  value       = aws_ecs_task_definition.main.arn
}

output "ecs_execution_role_arn" {
  description = "ARN of the ECS execution role"
  value       = aws_iam_role.ecs_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

output "autoscaling_target_resource_id" {
  description = "Resource ID of the autoscaling target"
  value       = aws_appautoscaling_target.ecs_target.resource_id
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.main.name
}

output "cloudwatch_log_group_arn" {
  description = "ARN of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.main.arn
}

output "security_group_alb_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}

output "security_group_ecs_id" {
  description = "ID of the ECS security group"
  value       = aws_security_group.ecs.id
}

output "application_url" {
  description = "URL of the application"
  value       = "https://${var.domain_name}"
}

output "health_check_url" {
  description = "Health check URL"
  value       = "https://${var.domain_name}${var.health_check_path}"
}

output "mongodb_uri_parameter_name" {
  description = "Name of the MongoDB URI SSM parameter"
  value       = aws_ssm_parameter.mongodb_uri.name
}

output "nextauth_secret_parameter_name" {
  description = "Name of the NextAuth secret SSM parameter"
  value       = aws_ssm_parameter.nextauth_secret.name
}

# Environment-specific outputs
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "primary_region" {
  description = "Primary AWS region"
  value       = var.primary_region
}

output "secondary_region" {
  description = "Secondary AWS region"
  value       = var.secondary_region
}

# Monitoring outputs
output "monitoring_dashboard_url" {
  description = "URL of the CloudWatch dashboard"
  value       = "https://${var.primary_region}.console.aws.amazon.com/cloudwatch/home?region=${var.primary_region}#dashboards:name=Revolution-Network"
}

output "ecs_console_url" {
  description = "URL of the ECS console"
  value       = "https://${var.primary_region}.console.aws.amazon.com/ecs/v2/clusters/${aws_ecs_cluster.main.name}/services"
}

output "alb_console_url" {
  description = "URL of the ALB console"
  value       = "https://${var.primary_region}.console.aws.amazon.com/ec2/v2/home?region=${var.primary_region}#LoadBalancers:search=${aws_lb.main.name}"
}

# Cost optimization outputs
output "estimated_monthly_cost" {
  description = "Estimated monthly cost for the infrastructure"
  value       = "~$200-500/month (varies based on usage)"
}

output "cost_optimization_recommendations" {
  description = "Cost optimization recommendations"
  value = [
    "Use Spot Instances for non-production workloads",
    "Implement S3 Intelligent Tiering for storage",
    "Enable CloudWatch detailed monitoring only when needed",
    "Use Reserved Instances for production workloads",
    "Implement auto-scaling to reduce costs during low usage"
  ]
}

# Security outputs
output "security_recommendations" {
  description = "Security recommendations"
  value = [
    "Enable AWS Config for compliance monitoring",
    "Implement AWS GuardDuty for threat detection",
    "Use AWS Secrets Manager for sensitive data",
    "Enable VPC Flow Logs for network monitoring",
    "Implement AWS WAF for web application protection"
  ]
}

# Disaster recovery outputs
output "disaster_recovery_recommendations" {
  description = "Disaster recovery recommendations"
  value = [
    "Implement cross-region backup for critical data",
    "Set up RDS read replicas in secondary region",
    "Configure Route 53 health checks for failover",
    "Implement automated backup testing",
    "Create disaster recovery runbooks"
  ]
}

# Performance outputs
output "performance_recommendations" {
  description = "Performance optimization recommendations"
  value = [
    "Implement CloudFront CDN for static assets",
    "Use ElastiCache for Redis caching",
    "Enable ECS service auto-scaling",
    "Implement database connection pooling",
    "Use S3 Transfer Acceleration for file uploads"
  ]
}
