from __future__ import annotations

import argparse
import json
from pathlib import Path

from .renderer import parse_article, render_article
from .wechat_api import WechatClient, load_config


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="微信公众号排版与草稿工具")
    parser.add_argument("command", choices=["render", "draft", "pipeline"], help="执行的命令")
    parser.add_argument("source", help="文章源文件路径，支持 Markdown/HTML")
    parser.add_argument("--config", default="config/wechat_publish.example.json", help="配置文件路径")
    parser.add_argument("--template", default="config/wechat_style.html", help="排版模板路径")
    parser.add_argument("--output-dir", default="output/wechat", help="输出目录")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    source_path = Path(args.source).resolve()
    config_path = Path(args.config).resolve() if args.config else None
    template_path = Path(args.template).resolve() if args.template else None
    output_dir = Path(args.output_dir).resolve()

    article = parse_article(source_path)
    render_result = render_article(article, output_dir=output_dir, template_path=template_path)

    if args.command == "render":
        print(
            json.dumps(
                {
                    "html": str(render_result.output_html_path),
                    "preview": str(render_result.output_preview_path),
                    "metadata": str(render_result.output_metadata_path),
                    "images": [str(path) for path in render_result.local_image_paths],
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return

    config = load_config(config_path)
    config["output_dir"] = str(output_dir)
    client = WechatClient(config)
    draft_result = client.create_draft_from_render(render_result)
    print(
        json.dumps(
            {
                "preview": str(render_result.output_preview_path),
                "draft_response": draft_result.draft_response,
                "uploaded_images": draft_result.uploaded_images,
                "response_file": str(draft_result.output_response_path),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
