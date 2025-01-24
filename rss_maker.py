#!/usr/bin/env python3


import os
from datetime import datetime, timezone
from email.utils import format_datetime


import datetime
from email import utils


def now_rfc2282():
    nowdt = datetime.datetime.now(timezone.utc)
    return format_datetime(nowdt)


def _main() -> None:
    projects = os.walk("projects")

    header = """<?xml version="1.0" encoding="utf-8"?>
            <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
            <channel>
                <title>ShadowMitia.eu</title>
                <description>ShadowMitia's website</description>
                <link>https://www.shadowmitia.eu</link>
                <atom:link href="https://shadowmitia.eu/feed.xml" rel="self" type="application/rss+xml" />

            """

    footer = """

    </channel>

    </rss>"""

    with open("feed.xml", "w") as writer:
        writer.write(header)
        build_date = now_rfc2282()
        writer.write(f"""<lastBuildDate>{build_date}</lastBuildDate>
            """)

        for path, _, files in projects:
            if "index.html" in files:
                with open(f"{path}/index.html") as f:
                    page = f.read()
                    print(page)
                    dt_start = page.find("datetime") + 2 + len("datetime")
                    dt_end = page.find('"', dt_start)
                    published_on = page[dt_start:dt_end]
                    published_on = datetime.datetime.fromisoformat(published_on)
                    published_on = format_datetime(published_on)
                    print(published_on)
                    url = f"https://shadowmitia.eu/{path}"
                    print(url)
                    title_start = page.find("h1") + 1 + len("h1")
                    title_end = page.find("</h1", title_start)
                    title = page[title_start:title_end]

                    writer.write(f"""<item>
                        <title>{title}</title>
                        <link>{url}</link>
                        <guid>{url}</guid>
                        <pubDate>{published_on}</pubDate>
                        </item>""")

        writer.write(footer)


if __name__ == "__main__":
    _main()
