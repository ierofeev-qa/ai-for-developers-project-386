setup:
	npm ci

build:
	npm run build

test:
	npm run test:api

lint:
	npm run lint

.PHONY: setup build test lint
