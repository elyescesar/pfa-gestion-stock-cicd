locals {
  kubeconfig_file = pathexpand(coalesce(var.kubeconfig_path, "~/.kube/config"))
}

provider "kubernetes" {
  config_path = local.kubeconfig_file
}

provider "helm" {
  kubernetes {
    config_path = local.kubeconfig_file
  }
}
