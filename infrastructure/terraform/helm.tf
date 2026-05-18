locals {
  ingress_values_file = var.coolify_coexist ? "ingress-nginx-coolify.yaml" : "ingress-nginx-vps.yaml"

  grafana_ingress_coolify = {
    enabled          = true
    ingressClassName = "nginx"
    hosts            = [var.grafana_host]
    annotations      = {}
    tls              = []
  }

  grafana_ingress_standalone = {
    enabled          = true
    ingressClassName = "nginx"
    hosts            = [var.grafana_host]
    annotations = {
      "cert-manager.io/cluster-issuer" = "letsencrypt-prod"
    }
    tls = [{
      secretName = "grafana-tls"
      hosts      = [var.grafana_host]
    }]
  }

  grafana_ingress = var.coolify_coexist ? local.grafana_ingress_coolify : local.grafana_ingress_standalone

  dashboard_ingress_coolify = {
    enabled               = true
    ingressClassName      = "nginx"
    hosts                 = [var.dashboard_host]
    annotations           = {}
    useDefaultAnnotations = false
    issuer = {
      scope = "disabled"
    }
    tls = {
      enabled    = false
      secretName = ""
      hosts      = []
    }
  }

  dashboard_ingress_standalone = {
    enabled               = true
    ingressClassName      = "nginx"
    hosts                 = [var.dashboard_host]
    useDefaultAnnotations = false
    annotations = {
      "cert-manager.io/cluster-issuer" = "letsencrypt-prod"
    }
    issuer = {
      scope = "cluster"
    }
    tls = {
      enabled    = true
      secretName = "kubernetes-dashboard-tls"
      hosts      = [var.dashboard_host]
    }
  }

  dashboard_ingress = var.coolify_coexist ? local.dashboard_ingress_coolify : local.dashboard_ingress_standalone

  pgadmin_ingress_coolify = {
    enabled          = true
    ingressClassName = "nginx"
    hosts = [{
      host = var.pgadmin_host
      paths = [{
        path     = "/"
        pathType = "Prefix"
      }]
    }]
    annotations = {}
    tls         = []
  }

  pgadmin_ingress_standalone = {
    enabled          = true
    ingressClassName = "nginx"
    hosts = [{
      host = var.pgadmin_host
      paths = [{
        path     = "/"
        pathType = "Prefix"
      }]
    }]
    annotations = {
      "cert-manager.io/cluster-issuer" = "letsencrypt-prod"
    }
    tls = [{
      secretName = "pgadmin-tls"
      hosts      = [var.pgadmin_host]
    }]
  }

  pgadmin_ingress_values = var.coolify_coexist ? local.pgadmin_ingress_coolify : local.pgadmin_ingress_standalone
}

resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = kubernetes_namespace.ingress_nginx.metadata[0].name
  create_namespace = false
  version          = "4.11.3"
  timeout          = 600
  wait             = true

  values = [
    file("${path.module}/values/${local.ingress_values_file}")
  ]
}

resource "helm_release" "kube_prometheus" {
  name             = "kube-prometheus-stack"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  namespace        = kubernetes_namespace.monitoring.metadata[0].name
  create_namespace = false
  version          = "65.5.0"
  timeout          = 900
  wait             = true

  values = [
    file("${path.module}/../../monitoring/kube-prometheus-values.yaml"),
    yamlencode({
      grafana = {
        adminPassword = tostring(var.grafana_admin_password)
        ingress       = local.grafana_ingress
      }
    })
  ]

  depends_on = [helm_release.ingress_nginx]
}

resource "helm_release" "pgadmin" {
  name             = "pgadmin"
  repository       = "https://helm.runix.net"
  chart            = "pgadmin4"
  namespace        = kubernetes_namespace.pgadmin.metadata[0].name
  create_namespace = false
  version          = "1.29.0"
  timeout          = 600
  wait             = true

  values = [
    yamlencode({
      env = {
        email    = var.pgadmin_email
        password = tostring(var.pgadmin_password)
      }
      ingress = local.pgadmin_ingress_values
    })
  ]

  depends_on = [helm_release.ingress_nginx]
}

resource "helm_release" "kubernetes_dashboard" {
  name             = "kubernetes-dashboard"
  # Repo GitHub Pages (kubernetes.github.io/dashboard) indisponible ; chart via release GitHub.
  chart            = "https://github.com/kubernetes-retired/dashboard/releases/download/kubernetes-dashboard-7.14.0/kubernetes-dashboard-7.14.0.tgz"
  namespace        = kubernetes_namespace.kubernetes_dashboard.metadata[0].name
  create_namespace = false
  timeout          = 600
  wait             = true

  values = [
    yamlencode({
      app = {
        ingress = local.dashboard_ingress
      }
      kong = {
        proxy = {
          type = "ClusterIP"
        }
      }
    })
  ]

  depends_on = [helm_release.ingress_nginx]
}
