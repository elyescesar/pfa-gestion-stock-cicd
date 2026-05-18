variable "kubeconfig_path" {
  type        = string
  default     = null
  description = "Chemin vers kubeconfig VPS (ex. ~/k3s-pfa.yaml). Requis si ~/.kube/config n'existe pas. Ou: ln -sf ~/k3s-pfa.yaml ~/.kube/config"
}

variable "coolify_coexist" {
  type        = bool
  default     = true
  description = "true = même VPS que Coolify : ingress NodePort 30080, pas de cert-manager (TLS via Coolify). false = VPS dédié : LoadBalancer + cert-manager."
}

variable "ingress_http_node_port" {
  type        = number
  default     = 30080
  description = "NodePort HTTP ingress-nginx quand coolify_coexist = true."
}

variable "namespace_app" {
  type    = string
  default = "pfa-stock"
}

variable "namespace_monitoring" {
  type    = string
  default = "monitoring"
}

variable "domain_base" {
  type    = string
  default = "pfa.elyes.dev"
}

variable "grafana_host" {
  type    = string
  default = "grafana.pfa.elyes.dev"
}

variable "pgadmin_host" {
  type    = string
  default = "pgadmin.pfa.elyes.dev"
}

variable "dashboard_host" {
  type    = string
  default = "dashboard.pfa.elyes.dev"
}

variable "acme_email" {
  type    = string
  default = "admin@elyes.dev"
}

variable "grafana_admin_password" {
  type      = string
  default   = "GrafanaAdmin123!"
  sensitive = true
}

variable "pgadmin_email" {
  type    = string
  default = "admin@pfa.elyes.dev"
}

variable "pgadmin_password" {
  type      = string
  default   = "PgAdminChangeMe!"
  sensitive = true
}

variable "postgres_user" {
  type    = string
  default = "stock"
}

variable "postgres_password" {
  type      = string
  default   = "stock"
  sensitive = true
}

variable "postgres_database" {
  type    = string
  default = "stock_db"
}
