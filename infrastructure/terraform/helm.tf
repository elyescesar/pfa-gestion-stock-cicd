resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = kubernetes_namespace.ingress_nginx.metadata[0].name
  create_namespace = false
  version          = "4.11.3"

  set {
    name  = "controller.publishService.enabled"
    value = "true"
  }
}

resource "helm_release" "kube_prometheus" {
  name             = "kube-prometheus-stack"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  namespace        = kubernetes_namespace.monitoring.metadata[0].name
  create_namespace = false
  version          = "65.5.0"
  timeout          = 600

  values = [
    file("${path.module}/../../monitoring/kube-prometheus-values.yaml")
  ]

  set_sensitive {
    name  = "grafana.adminPassword"
    value = var.grafana_admin_password
  }

  depends_on = [helm_release.ingress_nginx]
}

resource "helm_release" "pfa_stock" {
  name             = "pfa-stock"
  chart            = "${path.module}/../../helm/pfa-stock"
  namespace        = var.namespace_app
  create_namespace = true
  timeout          = 600

  set {
    name  = "monitoring.releaseLabel"
    value = "kube-prometheus-stack"
  }

  depends_on = [helm_release.kube_prometheus]
}
