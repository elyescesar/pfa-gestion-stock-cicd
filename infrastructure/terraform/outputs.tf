output "coolify_coexist" {
  value = var.coolify_coexist
}

output "ingress_http_node_port" {
  value       = var.coolify_coexist ? var.ingress_http_node_port : 80
  description = "Port hôte pour le proxy Coolify → k3s (HTTP). Ignorer si VPS dédié."
}

output "coolify_proxy_hint" {
  value = var.coolify_coexist ? "Configurer Coolify/Traefik : backend http://127.0.0.1:${var.ingress_http_node_port} pour chaque host *.pfa.elyes.dev (voir docs/vps-setup.md)" : "Ingress LoadBalancer expose 80/443 sur le nœud."
}
