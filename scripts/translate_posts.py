import sys
import json
import re
import time
import argparse
from pathlib import Path

# Fix stdout encoding on Windows
if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from deep_translator import MyMemoryTranslator

def strip_inline_markdown(value):
    val = str(value or '')
    val = re.sub(r'!\[([^\]]*)\]\([^)]+\)', r'\1', val)
    val = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', val)
    val = re.sub(r'(\*\*|__|\*|_)', '', val)
    val = re.sub(r'^#+\s+', '', val)
    val = re.sub(r'\s+', ' ', val)
    return val.strip()

def is_broken_post_title(title):
    val = str(title or '').strip()
    if not val:
        return True
    if val.startswith('!['):
        return True
    if re.match(r'^https?://', val, re.I):
        return True
    if re.match(r'^\[[^\]]+\]\(https?://', val):
        return True
    if re.match(r'^\[[^\]]+\]\([^)]+\)$', val):
        return True
    if re.search(r'\]\(https?://\S+\.{3}$', val):
        return True
    return False

def extract_title_from_content(content):
    for line in str(content or '').splitlines():
        trimmed = line.strip()
        if not trimmed:
            continue
        if re.match(r'^##\s+(Media|Links|Tags)\b', trimmed, re.I):
            break
        if re.match(r'^#{1,6}\s+', trimmed):
            return strip_inline_markdown(trimmed)
        if re.match(r'^[-*]\s+\[?(photo|video|image|audio)\]?', trimmed, re.I):
            continue
        cleaned = strip_inline_markdown(trimmed)
        if len(cleaned) > 3:
            return cleaned
    return ''

def resolve_source_title(post):
    raw = str(post.get("title", "")).strip()
    if not is_broken_post_title(raw):
        return strip_inline_markdown(raw)
    from_content = extract_title_from_content(post.get("content", ""))
    if from_content:
        return from_content
    return "Untitled post"

def split_text_into_chunks(text, max_len=450):
    text = text.strip()
    if not text:
        return []
    if len(text) <= max_len:
        return [text]

    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = ""
    for s in sentences:
        if len(current) + len(s) + 1 <= max_len:
            current = f"{current} {s}".strip()
        else:
            if current:
                chunks.append(current)
            if len(s) > max_len:
                words = s.split(' ')
                sub_current = ""
                for w in words:
                    if len(sub_current) + len(w) + 1 <= max_len:
                        sub_current = f"{sub_current} {w}".strip()
                    else:
                        if sub_current:
                            chunks.append(sub_current)
                        sub_current = w
                if sub_current:
                    chunks.append(sub_current)
                current = ""
            else:
                current = s
    if current:
        chunks.append(current)
    return chunks

def translate_piece(translator, text, retries=3):
    text = text.strip()
    if not text:
        return ""
    if re.match(r'^https?://', text) or re.match(r'^#\w+', text):
        return text

    for attempt in range(retries):
        try:
            res = translator.translate(text)
            if res:
                return res
        except Exception as e:
            wait_time = 2.0 * (attempt + 1)
            time.sleep(wait_time)
            if attempt == retries - 1:
                return text
    return text

def translate_content(translator, content):
    if not content:
        return ""

    meta_match = re.search(r'\n##\s+(Media|Links|Tags)\b', content, re.IGNORECASE)
    if meta_match:
        main_body = content[:meta_match.start()]
        meta_body = content[meta_match.start():]
    else:
        main_body = content
        meta_body = ""

    paragraphs = [p.strip() for p in main_body.split('\n\n') if p.strip()]
    translated_paragraphs = []

    # Pack paragraphs into groups of ~400 chars to minimize API calls
    current_group = []
    current_len = 0
    groups = []

    for para in paragraphs:
        if current_len + len(para) + 2 <= 420:
            current_group.append(para)
            current_len += len(para) + 2
        else:
            if current_group:
                groups.append('\n\n'.join(current_group))
            if len(para) > 420:
                # Need sentence splitting
                chunks = split_text_into_chunks(para, max_len=420)
                for c in chunks:
                    groups.append(c)
                current_group = []
                current_len = 0
            else:
                current_group = [para]
                current_len = len(para)

    if current_group:
        groups.append('\n\n'.join(current_group))

    for grp in groups:
        trans = translate_piece(translator, grp)
        translated_paragraphs.append(trans)
        time.sleep(0.3)

    return '\n\n'.join(translated_paragraphs) + meta_body

def main():
    parser = argparse.ArgumentParser(description="Translate posts in public/data/posts.json to English")
    parser.add_argument("--count", type=int, default=50, help="Number of posts from the top to translate (default: 50)")
    parser.add_argument("--all", action="store_true", help="Translate all posts in the file")
    parser.add_argument("--force", action="store_true", help="Force re-translation of already translated posts")
    parser.add_argument("--email", type=str, default="alevoldon@gmail.com", help="Email for MyMemory 50k quota")
    args = parser.parse_args()

    json_path = Path("public/data/posts.json")
    if not json_path.exists():
        print(f"Error: {json_path} not found.")
        sys.exit(1)

    print(f"Reading {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    posts = data.get("posts", [])
    total_posts = len(posts)
    print(f"Loaded {total_posts} posts.")

    limit = total_posts if args.all else min(args.count, total_posts)
    print(f"Processing target: first {limit} posts with email '{args.email}'...")

    translator = MyMemoryTranslator(source='ru-RU', target='en-GB', email=args.email)
    translated_count = 0
    skipped_count = 0

    for idx in range(limit):
        post = posts[idx]
        post_id = post.get("id", idx)

        # Skip if already translated properly (and not broken title)
        has_title_en = bool(post.get("title_en"))
        has_content_en = bool(post.get("content_en"))
        is_bad_title = is_broken_post_title(post.get("title_en", ""))

        if not args.force and has_title_en and has_content_en and not is_bad_title:
            skipped_count += 1
            continue

        raw_title = resolve_source_title(post)
        raw_content = post.get("content", "")

        print(f"[{idx + 1}/{limit}] Post #{post_id}: '{raw_title[:40]}...' ->", end=" ", flush=True)

        # 1. Translate Title
        if raw_title:
            title_en = translate_piece(translator, raw_title)
            time.sleep(0.3)
        else:
            title_en = ""

        # 2. Translate Content
        content_en = translate_content(translator, raw_content)

        post["title_en"] = title_en
        post["content_en"] = content_en
        translated_count += 1
        print(f" '{title_en[:45]}'")

        # Save progress every 5 posts
        if translated_count % 5 == 0:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

    # Final save
    print("\nSaving updated posts.json...")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Translated: {translated_count}, Skipped (already valid English): {skipped_count}.")

if __name__ == "__main__":
    main()
