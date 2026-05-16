MAIN = main
LATEX = pdflatex
BIBER = biber

.PHONY: all clean watch

all: $(MAIN).pdf

$(MAIN).pdf: $(MAIN).tex preamble.tex chapters/*.tex
	$(LATEX) -interaction=nonstopmode $(MAIN).tex
	$(LATEX) -interaction=nonstopmode $(MAIN).tex

clean:
	rm -f $(MAIN).{aux,bbl,blg,log,out,toc,lof,lot,pdf,bcf,run.xml,fls,fdb_latexmk,synctex.gz}

watch:
	@while true; do make all; inotifywait -qe close_write . chapters; done
