from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class ArticleMetadata:
    title: str
    author: str = ""
    digest: str = ""
    cover_image: str = ""
    content_source_url: str = ""
    need_open_comment: int = 0
    only_fans_can_comment: int = 0
    thumb_media_id: str = ""
    tags: list[str] = field(default_factory=list)
    extra: dict[str, Any] = field(default_factory=dict)


@dataclass
class ArticleDocument:
    source_path: Path
    slug: str
    metadata: ArticleMetadata
    body: str
    body_format: str


@dataclass
class RenderResult:
    article: ArticleDocument
    html: str
    preview_html: str
    output_html_path: Path
    output_preview_path: Path
    output_metadata_path: Path
    local_image_paths: list[Path]


@dataclass
class WechatDraftResult:
    draft_response: dict[str, Any]
    uploaded_images: dict[str, str]
    output_response_path: Path
