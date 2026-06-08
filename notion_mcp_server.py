import os

import requests
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

load_dotenv()

mcp = FastMCP("Notion Mini")

NOTION_TOKEN = os.getenv("NOTION_TOKEN")
NOTION_VERSION = os.getenv("NOTION_VERSION", "2026-03-11")


def notion_headers():
    if not NOTION_TOKEN:
        raise RuntimeError("NOTION_TOKEN is missing in .env")

    return {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def get_title(page: dict) -> str:
    for prop in page.get("properties", {}).values():
        if prop.get("type") == "title":
            texts = prop.get("title", [])
            return "".join(text.get("plain_text", "") for text in texts) or "Untitled"

    return "Untitled"


@mcp.tool()
def search_notion_pages(query: str, limit: int = 5) -> str:
    """Search Notion pages by title."""
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

    response.raise_for_status()
    pages = response.json().get("results", [])

    if not pages:
        return "No Notion pages found."

    lines = []
    for page in pages:
        title = get_title(page)
        url = page.get("url", "")
        edited = page.get("last_edited_time", "")

        lines.append(f"- {title}\n  URL: {url}\n  Last edited: {edited}")

    return "\n\n".join(lines)


if __name__ == "__main__":
    mcp.run(transport="stdio")