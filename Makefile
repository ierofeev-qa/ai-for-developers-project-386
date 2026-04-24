setup:
	npm ci

build:
	npm run build --workspaces

test:
	npm run test --workspaces

lint:
	npm run lint --workspace=frontend || true

.PHONY: setup build test lint
