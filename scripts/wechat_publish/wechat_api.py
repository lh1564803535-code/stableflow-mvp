from __future__ import annotations

import json
import mimetypes
import time
from pathlib import Path
from typing import Any
from urllib import parse, request

from .models import RenderResult, WechatDraftResult
from .renderer import replace_image_sources


class WechatApiError(RuntimeError):
    pass


class WechatClient:
    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.app_id = require_value(config, "app_id")
        self.app_secret = require_value(config, "app_secret")
        self.author = str(config.get("author", "")).strip()
        self.output_dir = Path(config.get("output_dir", "output/wechat"))

    def create_draft_from_render(self, render_result: RenderResult) -> WechatDraftResult:
        token = self.get_access_token()
        image_mapping: dict[str, str] = {}
        for image_path in render_result.local_image_paths:
            image_mapping[str(image_path.resolve())] = self.upload_image_for_article(token, image_path)
        final_html = replace_image_sources(
            render_result.html,
            image_mapping,
            render_result.article.source_path.parent,
        )
        payload = self.build_draft_payload(render_result, final_html)
        response = self.request_json(
            f"https://api.weixin.qq.com/cgi-bin/draft/add?access_token={parse.quote(token)}",
            payload,
        )
        self.output_dir.mkdir(parents=True, exist_ok=True)
        output_response_path = self.output_dir / f"{render_result.article.slug}.draft-response.json"
        output_response_path.write_text(
            json.dumps(
                {
                    "draft_response": response,
                    "uploaded_images": image_mapping,
                    "final_html": final_html,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        return WechatDraftResult(
            draft_response=response,
            uploaded_images=image_mapping,
            output_response_path=output_response_path,
        )

    def build_draft_payload(self, render_result: RenderResult, final_html: str) -> dict[str, Any]:
        metadata = render_result.article.metadata
        thumb_media_id = metadata.thumb_media_id or str(self.config.get("thumb_media_id", "")).strip()
        if not thumb_media_id:
            raise WechatApiError("缺少 thumb_media_id。请在文章 frontmatter 或配置中提供。")
        return {
            "articles": [
                {
                    "title": metadata.title,
                    "author": metadata.author or self.author,
                    "digest": metadata.digest,
                    "content": final_html,
                    "content_source_url": metadata.content_source_url,
                    "thumb_media_id": thumb_media_id,
                    "need_open_comment": metadata.need_open_comment,
                    "only_fans_can_comment": metadata.only_fans_can_comment,
                }
            ]
        }

    def get_access_token(self) -> str:
        cache_path = self.output_dir / ".wechat_token_cache.json"
        if cache_path.exists():
            try:
                cached = json.loads(cache_path.read_text(encoding="utf-8"))
                expires_at = float(cached.get("expires_at", 0))
                if expires_at > time.time() + 60 and cached.get("access_token"):
                    return str(cached["access_token"])
            except (json.JSONDecodeError, OSError, ValueError):
                pass
        url = (
            "https://api.weixin.qq.com/cgi-bin/token"
            f"?grant_type=client_credential&appid={parse.quote(self.app_id)}"
            f"&secret={parse.quote(self.app_secret)}"
        )
        response = self.request_json(url)
        token = response.get("access_token")
        expires_in = int(response.get("expires_in", 0))
        if not token:
            raise WechatApiError(f"获取 access_token 失败：{response}")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(
            json.dumps(
                {
                    "access_token": token,
                    "expires_at": time.time() + max(expires_in - 120, 0),
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        return str(token)

    def upload_image_for_article(self, token: str, image_path: Path) -> str:
        url = f"https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token={parse.quote(token)}"
        boundary = f"----ClaudeWechatBoundary{int(time.time() * 1000)}"
        payload, content_type = build_multipart_payload(image_path, boundary)
        response = self.request_json(url, payload=payload, content_type=content_type)
        image_url = response.get("url")
        if not image_url:
            raise WechatApiError(f"上传图片失败：{response}")
        return str(image_url)

    def request_json(
        self,
        url: str,
        payload: dict[str, Any] | bytes | None = None,
        content_type: str = "application/json; charset=utf-8",
    ) -> dict[str, Any]:
        data: bytes | None = None
        headers = {}
        if payload is not None:
            if isinstance(payload, bytes):
                data = payload
            else:
                data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            headers["Content-Type"] = content_type
        req = request.Request(url, data=data, headers=headers, method="POST" if data is not None else "GET")
        with request.urlopen(req, timeout=30) as resp:
            text = resp.read().decode("utf-8")
        result = json.loads(text)
        if result.get("errcode") not in (None, 0):
            raise WechatApiError(f"微信接口报错：{result}")
        return result


def build_multipart_payload(image_path: Path, boundary: str) -> tuple[bytes, str]:
    mime_type = mimetypes.guess_type(image_path.name)[0] or "application/octet-stream"
    file_bytes = image_path.read_bytes()
    parts = [
        f"--{boundary}\r\n".encode("utf-8"),
        (
            f'Content-Disposition: form-data; name="media"; filename="{image_path.name}"\r\n'
            f"Content-Type: {mime_type}\r\n\r\n"
        ).encode("utf-8"),
        file_bytes,
        b"\r\n",
        f"--{boundary}--\r\n".encode("utf-8"),
    ]
    return b"".join(parts), f"multipart/form-data; boundary={boundary}"


def load_config(config_path: Path | None) -> dict[str, Any]:
    if config_path is None:
        return {
            "app_id": "",
            "app_secret": "",
            "author": "",
            "thumb_media_id": "",
            "output_dir": "output/wechat",
        }
    return json.loads(config_path.read_text(encoding="utf-8"))


def require_value(config: dict[str, Any], key: str) -> str:
    value = str(config.get(key, "")).strip()
    if not value:
        raise WechatApiError(f"配置缺少 {key}")
    return value
