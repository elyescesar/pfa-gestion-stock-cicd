MAIN = main
LATEX = pdflatex

.PHONY: all clean watch

all: $(MAIN).pdf

# Plusieurs passes : la 1re écrit .toc/.lof/.lot ; les suivantes les composent.
# Le préfixe '-' laisse make continuer malgré les avertissements LaTeX non bloquants.
$(MAIN).pdf: $(MAIN).tex preamble.tex chapters/*.tex
	-$(LATEX) -interaction=nonstopmode $(MAIN).tex
	-$(LATEX) -interaction=nonstopmode $(MAIN).tex
	-$(LATEX) -interaction=nonstopmode $(MAIN).tex
	@test -f $(MAIN).pdf

clean:
	rm -f $(MAIN).{aux,bbl,blg,log,out,toc,lof,lot,pdf,bcf,run.xml,fls,fdb_latexmk,synctex.gz}

watch:
	@while true; do make all; inotifywait -qe close_write . chapters; done
