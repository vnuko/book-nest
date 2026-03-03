# Frontend README Update Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update `frontend/README.md` with a professional, friendly, and more complete overview of the frontend, without making it too long.

**Architecture:** The frontend is a Vite + React app that consumes the backend REST API and uses generated OpenAPI types for strongly typed integration. The README should explain purpose, prerequisites, run steps, key scripts, env config, project structure, and API integration flow in a concise way.

**Tech Stack:** React, TypeScript, Vite, OpenAPI (openapi-typescript), ESLint/Prettier.

### Task 1: Review current README and align with backend docs

**Files:**
- Modify: `frontend/README.md`

**Step 1: Identify missing sections**
- Compare existing content with the top-level README and backend README
- Note missing items: quickstart flow, env usage, API docs link, code generation notes, troubleshooting tips

**Step 2: Draft new section list**
- Overview (what it is, who it is for)
- Quick start (install, generate types, dev server)
- Environment variables (VITE_API_URL usage and where to set)
- API integration (OpenAPI, where types live, when to regenerate)
- Project structure (keep)
- Useful scripts (keep)
- Troubleshooting (API URL mismatch, generate:api fails)

### Task 2: Write updated README content

**Files:**
- Modify: `frontend/README.md`

**Step 1: Replace or reformat content into concise sections**
- Keep the length reasonable (classic README length)
- Keep friendly, professional tone
- Avoid excessive details

**Step 2: Add short usage examples**
- Provide a short example for `generate:api` usage
- Mention backend must be running for type generation

### Task 3: Verify updated README

**Step 1: Read the updated README**
- Ensure tone is professional and friendly
- Ensure all commands and paths are accurate
- Ensure references align with code (scripts in `frontend/package.json`)

### Task 4: Provide review summary

**Step 1: Summarize changes to user**
- List sections updated and rationale
