import os
import sys

import requests
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

load_dotenv()

mcp = FastMCP("Notion StarGo")

NOTION_TOKEN = os.getenv("NOTION_TOKEN")
NOTION_VERSION = os.getenv("NOTION_VERSION", "2026-03-11")


def debug_print(message: str) -> None:
    print(f"[notion-mcp] {message}", file=sys.stderr, flush=True)


def notion_headers():
    if not NOTION_TOKEN:
        raise RuntimeError("NOTION_TOKEN is missing in .env")

    debug_print("Notion headers prepared")
    return {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def get_title(page: dict) -> str:
    for prop in page.get("properties", {}).values():
        if prop.get("type") == "title":
            texts = prop.get("title", [])
            title = "".join(text.get("plain_text", "") for text in texts) or "Untitled"
            debug_print(f"Page title found: {title}")
            return title

    debug_print("Page title not found: Untitled")
    return "Untitled"


@mcp.tool()
def search_notion_pages(query: str, limit: int = 5) -> str:
    """Search Notion pages by title."""
    debug_print(f"Searching Notion pages: query={query!r}, limit={limit}")
    response = requests.post(
        "https://api.notion.com/v1/search",
        headers=notion_headers(),
        json={
            "query": query,
            "page_size": limit,
            "filter": {
                "property": "object",
                "value": "page",
            },
            "sort": {
                "direction": "descending",
                "timestamp": "last_edited_time",
            },
        },
        timeout=20,
    )

    debug_print(f"Notion search response: status={response.status_code}")
    response.raise_for_status()
    pages = response.json().get("results", [])
    debug_print(f"Notion pages returned: {len(pages)}")

    if not pages:
        debug_print("No Notion pages found")
        return "No Notion pages found."

    lines = []
    for index, page in enumerate(pages, start=1):
        title = get_title(page)
        url = page.get("url", "")
        edited = page.get("last_edited_time", "")

        debug_print(f"Result {index}: title={title!r}, url={url}, last_edited={edited}")
        lines.append(f"- {title}\n  URL: {url}\n  Last edited: {edited}")

    return "\n\n".join(lines)


if __name__ == "__main__":
    debug_print(f"Notion workspace connected: {requests.get('https://api.notion.com/v1/users/me', headers=notion_headers(), timeout=10).ok}")
    mcp.run(transport="stdio") 
