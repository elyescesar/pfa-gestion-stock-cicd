resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  namespace        = kubernetes_namespace.cert_manager.metadata[0].name
  create_namespace = false
  version          = "v1.16.2"
  timeout          = 600
  wait             = true

  set {
    name  = "crds.enabled"
    value = "true"
  }

  set {
    name  = "prometheus.enabled"
    value = "false"
  }
}

resource "kubernetes_manifest" "cluster_issuer_letsencrypt" {
  depends_on = [helm_release.cert_manager, helm_release.ingress_nginx]

  manifest = {
    apiVersion = "cert-manager.io/v1"
    kind       = "ClusterIssuer"
    metadata = {
      name = "letsencrypt-prod"
    }
    spec = {
      acme = {
        server = "https://acme-v02.api.letsencrypt.org/directory"
        email  = var.acme_email
        privateKeySecretRef = {
          name = "letsencrypt-prod-account-key"
        }
        solvers = [{
          http01 = {
            ingress = {
              class = "nginx"
            }
          }
        }]
      }
    }
  }
}
