resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = var.namespace_monitoring
  }
}

resource "kubernetes_namespace" "ingress_nginx" {
  metadata {
    name = "ingress-nginx"
  }
}

resource "kubernetes_namespace" "cert_manager" {
  metadata {
    name = "cert-manager"
  }
}

resource "kubernetes_namespace" "pfa_stock" {
  metadata {
    name = var.namespace_app
  }
}

resource "kubernetes_namespace" "pgadmin" {
  metadata {
    name = "pgadmin"
  }
}

resource "kubernetes_namespace" "kubernetes_dashboard" {
  metadata {
    name = "kubernetes-dashboard"
  }
}
