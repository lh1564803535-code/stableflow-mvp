from __future__ import annotations

import html
import json
import re
from pathlib import Path
from string import Template
from typing import Iterable

from .models import ArticleDocument, ArticleMetadata, RenderResult

FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n?", re.DOTALL)
IMAGE_RE = re.compile(r'<img[^>]*src=["\']([^"\']+)["\']', re.IGNORECASE)
CODE_FENCE_RE = re.compile(r"^```([a-zA-Z0-9_+-]*)\\s*$")
INLINE_CODE_RE = re.compile(r"`([^`]+)`")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
IMAGE_MD_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")


DEFAULT_STYLE = """<!doctype html>
<html lang=\"zh-CN\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>${title}</title>
  <style>
    body { margin: 0; background: #f5f5f5; color: #1f2328; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wechat-shell { max-width: 820px; margin: 0 auto; padding: 32px 16px 80px; }
    .wechat-article { background: #fff; padding: 32px 24px; border-radius: 16px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06); }
    .wechat-title { margin: 0 0 12px; font-size: 32px; line-height: 1.3; }
    .wechat-meta { margin: 0 0 28px; color: #57606a; font-size: 14px; }
    .wechat-digest { margin: 0 0 28px; padding: 14px 16px; border-left: 4px solid #07c160; background: #f6ffed; color: #3a3a3a; }
    .wechat-content { font-size: 17px; line-height: 1.9; }
    .wechat-content p { margin: 1em 0; }
    .wechat-content h1, .wechat-content h2, .wechat-content h3 { margin: 1.8em 0 0.8em; line-height: 1.45; }
    .wechat-content h1 { font-size: 1.8em; }
    .wechat-content h2 { font-size: 1.45em; padding-left: 0.6em; border-left: 4px solid #07c160; }
    .wechat-content h3 { font-size: 1.2em; }
    .wechat-content blockquote { margin: 1.2em 0; padding: 0.9em 1em; background: #f6f8fa; color: #57606a; border-left: 4px solid #d0d7de; }
    .wechat-content ul, .wechat-content ol { padding-left: 1.4em; margin: 1em 0; }
    .wechat-content li { margin: 0.4em 0; }
    .wechat-content hr { margin: 2em auto; width: 30%; border: none; border-top: 1px solid #d8dee4; }
    .wechat-content pre { overflow-x: auto; padding: 14px 16px; border-radius: 12px; background: #0d1117; color: #e6edf3; font-size: 14px; line-height: 1.6; }
    .wechat-content code { padding: 0.15em 0.35em; border-radius: 6px; background: rgba(175,184,193,0.2); font-size: 0.92em; }
    .wechat-content pre code { padding: 0; background: transparent; }
    .wechat-content figure { margin: 1.5em 0; }
    .wechat-content img { display: block; max-width: 100%; height: auto; margin: 0 auto; border-radius: 12px; }
    .wechat-content figcaption { margin-top: 0.7em; color: #57606a; text-align: center; font-size: 13px; }
    .wechat-footer { margin-top: 28px; padding-top: 20px; color: #57606a; font-size: 13px; border-top: 1px solid #d8dee4; }
  </style>
</head>
<body>
  <div class=\"wechat-shell\">
    <article class=\"wechat-article\">
      <h1 class=\"wechat-title\">${title}</h1>
      <p class=\"wechat-meta\">${author_line}</p>
      ${digest_block}
      <section class=\"wechat-content\">${content}</section>
      ${footer_block}
    </article>
  </div>
</body>
</html>
"""


def parse_article(source_path: Path) -> ArticleDocument:
    text = source_path.read_text(encoding="utf-8")
    frontmatter, body = split_frontmatter(text)
    metadata = ArticleMetadata(
        title=str(frontmatter.pop("title", source_path.stem)).strip() or source_path.stem,
        author=str(frontmatter.pop("author", "")).strip(),
        digest=str(frontmatter.pop("digest", "")).strip(),
        cover_image=str(frontmatter.pop("cover_image", "")).strip(),
        content_source_url=str(frontmatter.pop("content_source_url", "")).strip(),
        need_open_comment=to_int(frontmatter.pop("need_open_comment", 0)),
        only_fans_can_comment=to_int(frontmatter.pop("only_fans_can_comment", 0)),
        thumb_media_id=str(frontmatter.pop("thumb_media_id", "")).strip(),
        tags=normalize_tags(frontmatter.pop("tags", [])),
        extra=frontmatter,
    )
    body_format = "html" if source_path.suffix.lower() in {".html", ".htm"} else "markdown"
    return ArticleDocument(
        source_path=source_path,
        slug=slugify(source_path.stem),
        metadata=metadata,
        body=body.strip(),
        body_format=body_format,
    )


def render_article(article: ArticleDocument, output_dir: Path, template_path: Path | None = None) -> RenderResult:
    output_dir.mkdir(parents=True, exist_ok=True)
    html_body = article.body if article.body_format == "html" else markdown_to_html(article.body)
    image_paths = find_local_images(html_body, article.source_path.parent)
    template_text = template_path.read_text(encoding="utf-8") if template_path and template_path.exists() else DEFAULT_STYLE
    preview_html = apply_template(template_text, article, html_body)
    output_html_path = output_dir / f"{article.slug}.wechat.html"
    output_preview_path = output_dir / f"{article.slug}.preview.html"
    output_metadata_path = output_dir / f"{article.slug}.metadata.json"
    output_html_path.write_text(html_body, encoding="utf-8")
    output_preview_path.write_text(preview_html, encoding="utf-8")
    output_metadata_path.write_text(
        json.dumps(
            {
                "title": article.metadata.title,
                "author": article.metadata.author,
                "digest": article.metadata.digest,
                "cover_image": article.metadata.cover_image,
                "content_source_url": article.metadata.content_source_url,
                "body_format": article.body_format,
                "local_image_paths": [str(path) for path in image_paths],
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return RenderResult(
        article=article,
        html=html_body,
        preview_html=preview_html,
        output_html_path=output_html_path,
        output_preview_path=output_preview_path,
        output_metadata_path=output_metadata_path,
        local_image_paths=image_paths,
    )


def apply_template(template_text: str, article: ArticleDocument, html_body: str) -> str:
    digest_block = (
        f'<section class="wechat-digest">{html.escape(article.metadata.digest)}</section>'
        if article.metadata.digest
        else ""
    )
    footer_items = []
    if article.metadata.content_source_url:
        url = html.escape(article.metadata.content_source_url, quote=True)
        footer_items.append(f'原文链接：<a href="{url}">{url}</a>')
    if article.metadata.tags:
        footer_items.append("标签：" + " / ".join(html.escape(tag) for tag in article.metadata.tags))
    footer_block = (
        '<footer class="wechat-footer">' + "<br />".join(footer_items) + "</footer>"
        if footer_items
        else ""
    )
    author_line = html.escape(article.metadata.author) if article.metadata.author else "未填写作者"
    return Template(template_text).safe_substitute(
        title=html.escape(article.metadata.title),
        author_line=author_line,
        digest_block=digest_block,
        content=html_body,
        footer_block=footer_block,
    )


def split_frontmatter(text: str) -> tuple[dict[str, object], str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    raw = match.group(1)
    body = text[match.end():]
    return parse_simple_frontmatter(raw), body


def parse_simple_frontmatter(raw: str) -> dict[str, object]:
    data: dict[str, object] = {}
    current_key: str | None = None
    for line in raw.splitlines():
        if not line.strip():
            continue
        if line.startswith("  - ") and current_key:
            data.setdefault(current_key, [])
            assert isinstance(data[current_key], list)
            data[current_key].append(line[4:].strip())
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        current_key = key.strip()
        value = value.strip()
        if value == "":
            data[current_key] = []
            continue
        data[current_key] = strip_quotes(value)
    return data


def strip_quotes(value: str) -> str:
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


def markdown_to_html(markdown_text: str) -> str:
    lines = markdown_text.splitlines()
    blocks: list[str] = []
    paragraph: list[str] = []
    list_type: str | None = None
    list_items: list[str] = []
    quote_lines: list[str] = []
    in_code = False
    code_lang = ""
    code_lines: list[str] = []

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            blocks.append(f"<p>{render_inline(' '.join(part.strip() for part in paragraph))}</p>")
            paragraph = []

    def flush_list() -> None:
        nonlocal list_type, list_items
        if list_type and list_items:
            items = "".join(f"<li>{render_inline(item)}</li>" for item in list_items)
            blocks.append(f"<{list_type}>{items}</{list_type}>")
        list_type = None
        list_items = []

    def flush_quote() -> None:
        nonlocal quote_lines
        if quote_lines:
            quote_html = markdown_to_html("\n".join(quote_lines))
            blocks.append(f"<blockquote>{quote_html}</blockquote>")
        quote_lines = []

    def flush_code() -> None:
        nonlocal in_code, code_lines, code_lang
        code_html = html.escape("\n".join(code_lines))
        class_attr = f' class="language-{html.escape(code_lang)}"' if code_lang else ""
        blocks.append(f"<pre><code{class_attr}>{code_html}</code></pre>")
        in_code = False
        code_lines = []
        code_lang = ""

    for line in lines:
        fence = CODE_FENCE_RE.match(line)
        if fence:
            flush_paragraph()
            flush_list()
            flush_quote()
            if in_code:
                flush_code()
            else:
                in_code = True
                code_lang = fence.group(1)
                code_lines = []
            continue
        if in_code:
            code_lines.append(line)
            continue
        stripped = line.strip()
        if not stripped:
            flush_paragraph()
            flush_list()
            flush_quote()
            continue
        if stripped == "---":
            flush_paragraph()
            flush_list()
            flush_quote()
            blocks.append("<hr />")
            continue
        if stripped.startswith(">"):
            flush_paragraph()
            flush_list()
            quote_lines.append(stripped[1:].strip())
            continue
        heading_match = re.match(r"^(#{1,3})\s+(.*)$", stripped)
        if heading_match:
            flush_paragraph()
            flush_list()
            flush_quote()
            level = len(heading_match.group(1))
            blocks.append(f"<h{level}>{render_inline(heading_match.group(2).strip())}</h{level}>")
            continue
        bullet_match = re.match(r"^[-*+]\s+(.*)$", stripped)
        if bullet_match:
            flush_paragraph()
            flush_quote()
            if list_type not in {None, "ul"}:
                flush_list()
            list_type = "ul"
            list_items.append(bullet_match.group(1).strip())
            continue
        ordered_match = re.match(r"^\d+\.\s+(.*)$", stripped)
        if ordered_match:
            flush_paragraph()
            flush_quote()
            if list_type not in {None, "ol"}:
                flush_list()
            list_type = "ol"
            list_items.append(ordered_match.group(1).strip())
            continue
        paragraph.append(stripped)

    if in_code:
        flush_code()
    flush_paragraph()
    flush_list()
    flush_quote()
    return "\n".join(blocks)


def render_inline(text: str) -> str:
    text = html.escape(text)
    text = IMAGE_MD_RE.sub(lambda m: render_image(m.group(2), m.group(1)), text)
    text = LINK_RE.sub(lambda m: f'<a href="{html.escape(m.group(2), quote=True)}">{m.group(1)}</a>', text)
    text = INLINE_CODE_RE.sub(lambda m: f"<code>{m.group(1)}</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", text)
    return text


def render_image(source: str, alt_text: str) -> str:
    safe_source = html.escape(source, quote=True)
    safe_alt = html.escape(alt_text)
    caption = f"<figcaption>{safe_alt}</figcaption>" if safe_alt else ""
    return f'<figure><img src="{safe_source}" alt="{safe_alt}" />{caption}</figure>'


def find_local_images(html_text: str, base_dir: Path) -> list[Path]:
    images: list[Path] = []
    for source in IMAGE_RE.findall(html_text):
        if source.startswith(("http://", "https://", "data:")):
            continue
        candidate = (base_dir / source).resolve()
        if candidate.exists():
            images.append(candidate)
    return images


def replace_image_sources(html_text: str, mapping: dict[str, str], base_dir: Path) -> str:
    def replace(match: re.Match[str]) -> str:
        original = match.group(1)
        if original.startswith(("http://", "https://", "data:")):
            return match.group(0)
        resolved = str((base_dir / original).resolve())
        remote = mapping.get(resolved)
        if not remote:
            return match.group(0)
        return match.group(0).replace(original, html.escape(remote, quote=True))

    return IMAGE_RE.sub(replace, html_text)


def normalize_tags(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [part.strip() for part in value.split(",") if part.strip()]
    return []


def slugify(value: str) -> str:
    lowered = value.strip().lower()
    lowered = re.sub(r"[^a-z0-9一-鿿-]+", "-", lowered)
    lowered = re.sub(r"-+", "-", lowered).strip("-")
    return lowered or "article"


def to_int(value: object) -> int:
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return 0
