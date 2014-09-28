PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

TESTS 		:= $(wildcard test/*.test.js)

.PHONY: all watch clean install test

all: $(DEST)

install: package.json
	npm install

test:
	@tape $(TESTS) | faucet
