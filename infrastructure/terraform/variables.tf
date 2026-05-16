variable "localstack_endpoint" {
  type    = string
  default = "http://localstack:4566"
}

variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "s3_bucket_name" {
  type    = string
  default = "pfa-stock-exports"
}

variable "namespace_app" {
  type    = string
  default = "pfa-stock"
}

variable "namespace_monitoring" {
  type    = string
  default = "monitoring"
}

variable "grafana_admin_password" {
  type      = string
  default   = "GrafanaAdmin123!"
  sensitive = true
}
