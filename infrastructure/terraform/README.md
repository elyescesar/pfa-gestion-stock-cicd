# Terraform — plateforme Kubernetes (optionnel)

- **Validation PFA** : `terraform fmt -check` et `terraform validate` en CI — pas d’apply requis.
- **Démo locale** : `make cluster` (scripts minikube) — pas de `terraform apply` sur le laptop.
- **Production optionnelle** : `terraform apply` sur un **VPS k3s dédié** — voir [docs/vps-setup.md](../../docs/vps-setup.md).

Le chart applicatif `pfa-stock` est déployé par Helm (`deploy.yml` manuel), pas par Terraform.
