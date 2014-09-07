PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash
browserify := node_modules/.bin/browserify
watchify := node_modules/.bin/watchify

ENTRY     	:= app.js
DEST 	 	:= build/bundle.js
TRANSFORMS 	:=
TESTS 		:= $(wildcard test/*.test.js)

.PHONY: all watch clean install test

all: $(DEST)

install: package.json
	npm install

clean:
	rm -rf $(dir $(DEST))

watch: $(DEST)
	watchify $(ENTRY) $(TRANSFORMS) -o $(DEST) -vd

test:
	@tape $(TESTS) | faucet

$(DEST): $(shell browserify $(TRANSFORMS) --list $(ENTRY))
	mkdir -p $(dir $@)
	browserify $(TRANSFORMS) $(ENTRY) > $@
