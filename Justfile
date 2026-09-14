# Project Task Runner

# List available recipes
default:
    @just --list

# Format code and configuration files
format: sync-agent-ignore
    bun run format

# Check formatting
check-format:
    bun run check-format

# Run code linting checks
lint:
    bun run lint

# Run type checks
typecheck:
    bun run typecheck

# Run test suite
test:
    bun test

# Build distribution bundle and TypeScript declarations
build:
    bun run build

# Regenerate .claude/settings.json's Read-deny rules from .agentignore
sync-agent-ignore:
    @scripts/sync-agent-ignore.sh

# Check that .claude/settings.json is in sync with .agentignore
check-agent-ignore-sync:
    @scripts/sync-agent-ignore.sh --check

# Run all local checks (sync, lint, format check, typecheck, tests, build)
validate: check-agent-ignore-sync lint check-format typecheck test build
