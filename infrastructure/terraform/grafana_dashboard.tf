resource "kubernetes_config_map" "grafana_dashboard_api" {
  metadata {
    name      = "grafana-dashboard-pfa-stock-api"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
    labels = {
      grafana_dashboard = "1"
    }
  }

  data = {
    "pfa-stock-api.json" = file("${path.module}/../../monitoring/dashboards/pfa-stock-api.json")
  }

  depends_on = [helm_release.kube_prometheus]
}
