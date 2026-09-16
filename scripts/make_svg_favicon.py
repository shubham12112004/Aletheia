import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

img_bytes = (PUBLIC / "favicon.png").read_bytes()
b64_str = base64.b64encode(img_bytes).decode("ascii")

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,{b64_str}" width="512" height="512"/>
</svg>
'''

(PUBLIC / "favicon.svg").write_text(svg_content, encoding="utf-8")
print("Updated favicon.svg with logo image data")
