# Mandatory Agent Memory Rule (Antigravity IDE)

## ALWAYS SAVE TO AGENTMEMORY MCP TOOL

1. **Session & Architecture Memory Persistence:**
   - Every time a significant task, architectural refactoring, feature addition, or session milestone is completed, the AI agent MUST call the `agentmemory` MCP tool (`memory_save`) to persist the learnings, file paths, and rules.

2. **Always Check Memories on Startup:**
   - At the beginning of each session or task, the AI agent MUST recall relevant knowledge using `memory_recall` or `memory_smart_search` from `agentmemory` before performing redundant research.

3. **ZipMoa Architecture Highlights:**
   - Project: ZipMoa (집모아)
   - Live URL: `https://realestateagent-12hc.vercel.app`
   - Scraper: `src/lib/applyhomeWebScraper.ts` (0-second direct web scraping)
   - Routes: `/login` (login page), `/dashboard` (main dashboard), `/` (homepage with multi-filter cards)
