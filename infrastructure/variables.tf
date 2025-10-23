# Variables for Revolution Network Infrastructure

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "primary_region" {
  description = "Primary AWS region"
  type        = string
  default     = "us-east-1"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.primary_region))
    error_message = "Primary region must be a valid AWS region."
  }
}

variable "secondary_region" {
  description = "Secondary AWS region for disaster recovery"
  type        = string
  default     = "us-west-2"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.secondary_region))
    error_message = "Secondary region must be a valid AWS region."
  }
}

variable "vercel_api_token" {
  description = "Vercel API token for deployment"
  type        = string
  sensitive   = true
}

variable "mongodb_atlas_public_key" {
  description = "MongoDB Atlas public key"
  type        = string
}

variable "mongodb_atlas_private_key" {
  description = "MongoDB Atlas private key"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "revolution-network.com"
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate"
  type        = string
  default     = ""
}

variable "min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 2
  
  validation {
    condition     = var.min_capacity >= 1
    error_message = "Minimum capacity must be at least 1."
  }
}

variable "max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 10
  
  validation {
    condition     = var.max_capacity >= var.min_capacity
    error_message = "Maximum capacity must be greater than or equal to minimum capacity."
  }
}

variable "cpu_target_value" {
  description = "Target CPU utilization percentage for auto-scaling"
  type        = number
  default     = 70.0
  
  validation {
    condition     = var.cpu_target_value > 0 && var.cpu_target_value <= 100
    error_message = "CPU target value must be between 1 and 100."
  }
}

variable "memory_target_value" {
  description = "Target memory utilization percentage for auto-scaling"
  type        = number
  default     = 80.0
  
  validation {
    condition     = var.memory_target_value > 0 && var.memory_target_value <= 100
    error_message = "Memory target value must be between 1 and 100."
  }
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
  
  validation {
    condition     = var.log_retention_days >= 1 && var.log_retention_days <= 3653
    error_message = "Log retention days must be between 1 and 3653."
  }
}

variable "backup_retention_days" {
  description = "Number of days to retain database backups"
  type        = number
  default     = 7
  
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 35
    error_message = "Backup retention days must be between 1 and 35."
  }
}

variable "monitoring_enabled" {
  description = "Enable detailed monitoring"
  type        = bool
  default     = true
}

variable "alerts_enabled" {
  description = "Enable CloudWatch alarms and alerts"
  type        = bool
  default     = true
}

variable "cost_optimization" {
  description = "Enable cost optimization features"
  type        = bool
  default     = true
}

variable "security_hardening" {
  description = "Enable additional security hardening"
  type        = bool
  default     = true
}

variable "multi_az" {
  description = "Enable multi-AZ deployment"
  type        = bool
  default     = true
}

variable "encryption_at_rest" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "encryption_in_transit" {
  description = "Enable encryption in transit"
  type        = bool
  default     = true
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
  
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid CIDR block."
  }
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "health_check_path" {
  description = "Path for health checks"
  type        = string
  default     = "/api/health"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
  
  validation {
    condition     = var.health_check_interval >= 5 && var.health_check_interval <= 300
    error_message = "Health check interval must be between 5 and 300 seconds."
  }
}

variable "health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
  
  validation {
    condition     = var.health_check_timeout >= 2 && var.health_check_timeout <= 60
    error_message = "Health check timeout must be between 2 and 60 seconds."
  }
}

variable "health_check_healthy_threshold" {
  description = "Number of consecutive health checks required to mark as healthy"
  type        = number
  default     = 2
  
  validation {
    condition     = var.health_check_healthy_threshold >= 2 && var.health_check_healthy_threshold <= 10
    error_message = "Health check healthy threshold must be between 2 and 10."
  }
}

variable "health_check_unhealthy_threshold" {
  description = "Number of consecutive health checks required to mark as unhealthy"
  type        = number
  default     = 2
  
  validation {
    condition     = var.health_check_unhealthy_threshold >= 2 && var.health_check_unhealthy_threshold <= 10
    error_message = "Health check unhealthy threshold must be between 2 and 10."
  }
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "notification_email" {
  description = "Email address for notifications and alerts"
  type        = string
  default     = ""
  
  validation {
    condition     = var.notification_email == "" || can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.notification_email))
    error_message = "Notification email must be a valid email address."
  }
}

variable "sns_topic_arn" {
  description = "ARN of SNS topic for notifications"
  type        = string
  default     = ""
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  sensitive   = true
  default     = ""
}

variable "datadog_api_key" {
  description = "Datadog API key for monitoring"
  type        = string
  sensitive   = true
  default     = ""
}

variable "newrelic_license_key" {
  description = "New Relic license key for monitoring"
  type        = string
  sensitive   = true
  default     = ""
}
