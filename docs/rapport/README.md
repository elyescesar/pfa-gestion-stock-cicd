# Rapport LaTeX — StockFlow

## Compilation

```bash
cd docs/rapport
make          # produit main.pdf (deux passes pdflatex)
make clean
```

Prérequis LaTeX (Arch Linux exemple) :

```bash
sudo pacman -S texlive-basic texlive-latex texlive-latexrecommended \
  texlive-latexextra texlive-fontsrecommended texlive-langfrench
```

## Structure

- `main.tex` — document principal
- `preamble.tex` — packages et styles
- `chapters/` — chapitres (14 + 2 annexes)
- `Makefile`

## Personnalisation

Remplacer les champs `[Nom Prénom]`, dates et URL dans `chapters/00-page-garde.tex` et `main.tex`.
