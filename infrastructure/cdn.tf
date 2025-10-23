# CloudFront CDN Configuration for Revolution Network

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "revolution-network-alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "X-Forwarded-Proto"
      value = "https"
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Revolution Network CDN Distribution"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "revolution-network-alb"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "CloudFront-Forwarded-Proto", "CloudFront-Is-Desktop-Viewer", "CloudFront-Is-Mobile-Viewer", "CloudFront-Is-Tablet-Viewer", "CloudFront-Viewer-Country"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # API routes cache behavior
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "revolution-network-alb"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "CloudFront-Forwarded-Proto"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
  }

  # Static assets cache behavior
  ordered_cache_behavior {
    path_pattern     = "/_next/static/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "revolution-network-alb"

    forwarded_values {
      query_string = false
      headers      = []
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 31536000
    max_ttl                = 31536000
    compress               = true
  }

  # Images cache behavior
  ordered_cache_behavior {
    path_pattern     = "/images/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "revolution-network-alb"

    forwarded_values {
      query_string = false
      headers      = []
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  # Fonts cache behavior
  ordered_cache_behavior {
    path_pattern     = "/fonts/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "revolution-network-alb"

    forwarded_values {
      query_string = false
      headers      = []
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 31536000
    max_ttl                = 31536000
    compress               = true
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.certificate_arn == "" ? true : false
    acm_certificate_arn            = var.certificate_arn != "" ? var.certificate_arn : null
    ssl_support_method             = var.certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version       = var.certificate_arn != "" ? "TLSv1.2_2021" : null
  }

  tags = local.common_tags
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "revolution-network-oac"
  description                       = "OAC for Revolution Network ALB"
  origin_access_control_origin_type = "application"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Cache Policy
resource "aws_cloudfront_cache_policy" "main" {
  name        = "revolution-network-cache-policy"
  comment     = "Cache policy for Revolution Network"
  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    query_strings_config {
      query_string_behavior = "all"
    }

    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Authorization", "CloudFront-Forwarded-Proto"]
      }
    }

    cookies_config {
      cookie_behavior = "all"
    }
  }
}

# CloudFront Origin Request Policy
resource "aws_cloudfront_origin_request_policy" "main" {
  name    = "revolution-network-origin-request-policy"
  comment = "Origin request policy for Revolution Network"

  cookies_config {
    cookie_behavior = "all"
  }

  headers_config {
    header_behavior = "whitelist"
    headers {
      items = ["Authorization", "CloudFront-Forwarded-Proto"]
    }
  }

  query_strings_config {
    query_string_behavior = "all"
  }
}

# CloudFront Response Headers Policy
resource "aws_cloudfront_response_headers_policy" "main" {
  name    = "revolution-network-response-headers-policy"
  comment = "Response headers policy for Revolution Network"

  security_headers_config {
    content_type_options {
      override = false
    }
    frame_options {
      frame_option = "DENY"
      override     = false
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = false
    }
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      override                   = false
    }
  }

  custom_headers_config {
    items {
      header   = "X-Content-Type-Options"
      override = false
      value    = "nosniff"
    }
    items {
      header   = "X-Frame-Options"
      override = false
      value    = "DENY"
    }
    items {
      header   = "X-XSS-Protection"
      override = false
      value    = "1; mode=block"
    }
  }
}

# Route 53 Record for CloudFront
resource "aws_route53_record" "main" {
  count = var.domain_name != "" ? 1 : 0

  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route 53 Zone
data "aws_route53_zone" "main" {
  count = var.domain_name != "" ? 1 : 0
  name  = var.domain_name
}

# WAF Web ACL for CloudFront
resource "aws_wafv2_web_acl" "main" {
  name  = "revolution-network-waf"
  scope = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "KnownBadInputsRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "SQLiRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "RevolutionNetworkWAFMetric"
    sampled_requests_enabled   = true
  }

  tags = local.common_tags
}

# Associate WAF with CloudFront
resource "aws_wafv2_web_acl_association" "main" {
  resource_arn = aws_cloudfront_distribution.main.arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}

# ElastiCache Redis Cluster for caching
resource "aws_elasticache_subnet_group" "main" {
  name       = "revolution-network-cache-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = local.common_tags
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id         = "revolution-network-redis"
  description                  = "Redis cluster for Revolution Network"
  node_type                    = "cache.t3.micro"
  port                         = 6379
  parameter_group_name         = "default.redis7"
  num_cache_clusters           = 2
  automatic_failover_enabled   = true
  multi_az_enabled            = var.multi_az
  subnet_group_name           = aws_elasticache_subnet_group.main.name
  security_group_ids          = [aws_security_group.redis.id]
  at_rest_encryption_enabled  = var.encryption_at_rest
  transit_encryption_enabled  = var.encryption_in_transit
  auth_token                  = var.encryption_in_transit ? random_password.redis_auth[0].result : null

  tags = local.common_tags
}

# Redis Security Group
resource "aws_security_group" "redis" {
  name_prefix = "revolution-network-redis-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from ECS"
    from_port       = 6379
    to_port         = 6379
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
    Name = "revolution-network-redis-sg"
  })
}

# Redis Auth Token
resource "random_password" "redis_auth" {
  count = var.encryption_in_transit ? 1 : 0

  length  = 32
  special = true
}

# S3 Bucket for static assets
resource "aws_s3_bucket" "static_assets" {
  bucket = "revolution-network-static-assets-${random_string.bucket_suffix.result}"

  tags = local.common_tags
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket_versioning" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Origin for S3
resource "aws_cloudfront_origin_access_identity" "s3" {
  comment = "OAI for Revolution Network S3 bucket"
}

resource "aws_s3_bucket_policy" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.s3.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.static_assets.arn}/*"
      }
    ]
  })
}
