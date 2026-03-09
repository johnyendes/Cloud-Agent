set -e

# 1) Get repo
cd ~
rm -rf Cloud-Agent || true
git clone https://github.com/johnyendes/Cloud-Agent.git
cd Cloud-Agent

# 2) Create virtualenv
python3 -m venv .venv
source .venv/bin/activate

# 3) Install deps
pip install --upgrade pip
pip install -r requirements.txt
pip install pytest httpx

# 4) Create folders
mkdir -p packrunner/app packrunner/packs packrunner/static tests

# 5) Write files
cat > packrunner/__init__.py <<'PY'
__all__ = ["app", "packs"]
PY

cat > packrunner/app/__init__.py <<'PY'
# app package
PY

cat > packrunner/packs/__init__.py <<'PY'
# packs package
PY

cat > packrunner/app/models.py <<'PY'
from __future__ import annotations

from typing import Any, Dict
from pydantic import BaseModel, Field


class PackRequest(BaseModel):
    pack_name: str = Field(..., min_length=1)
    payload: Dict[str, Any] = Field(default_factory=dict)


class PackResponse(BaseModel):
    status: str
    result: Dict[str, Any]
PY

cat > packrunner/packs/base.py <<'PY'
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict


class Pack(ABC):
    name: str

    @abstractmethod
    def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the pack and return a JSON-serializable dict."""
        raise NotImplementedError
PY

cat > packrunner/packs/echo_pack.py <<'PY'
from __future__ import annotations

from typing import Any, Dict
from .base import Pack


class EchoPack(Pack):
    name = "echo"

    def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {"echo": payload}
PY

cat > packrunner/packs/template_pack.py <<'PY'
from __future__ import annotations

from typing import Any, Dict, List
from .base import Pack


class TemplatePack(Pack):
    name = "template"

    def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        project = str(payload.get("project", "demo")).strip() or "demo"
        files = [
            f"{project}/app.py",
            f"{project}/requirements.txt",
            f"{project}/README.md",
        ]
        return {"files": files}
PY

cat > packrunner/app/registry.py <<'PY'
from __future__ import annotations

from typing import Dict, Optional

from packrunner.packs.base import Pack
from packrunner.packs.echo_pack import EchoPack
from packrunner.packs.template_pack import TemplatePack


class PackRegistry:
    def __init__(self) -> None:
        self._packs: Dict[str, Pack] = {}

    def register(self, pack: Pack) -> None:
        name = getattr(pack, "name", None)
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Pack must have a non-empty 'name'.")
        self._packs[name] = pack

    def get(self, name: str) -> Optional[Pack]:
        return self._packs.get(name)

    def list_names(self) -> list[str]:
        return sorted(self._packs.keys())


registry = PackRegistry()
registry.register(EchoPack())
registry.register(TemplatePack())
PY

cat > packrunner/app/runner.py <<'PY'
from __future__ import annotations

from typing import Any, Dict

from packrunner.app.registry import registry


class Runner:
    def execute(self, pack_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        pack = registry.get(pack_name)
        if pack is None:
            raise ValueError(f"Pack not found: {pack_name}")
        return pack.run(payload)


runner = Runner()
PY

cat > packrunner/app/api.py <<'PY'
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from packrunner.app.models import PackRequest, PackResponse
from packrunner.app.runner import runner
from packrunner.app.registry import registry

router = APIRouter()


@router.get("/packs")
def list_packs() -> dict:
    return {"packs": registry.list_names()}


@router.post("/run", response_model=PackResponse)
def run_pack(request: PackRequest) -> PackResponse:
    try:
        result = runner.execute(request.pack_name, request.payload)
        return PackResponse(status="success", result=result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
PY

cat > packrunner/app/main.py <<'PY'
from __future__ import annotations

from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from packrunner.app.api import router

app = FastAPI(title="PackRunner", version="1.0.0")
app.include_router(router)

static_dir = Path(__file__).resolve().parent.parent / "static"
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
def index() -> FileResponse:
    return FileResponse(str(static_dir / "index.html"))
PY

cat > packrunner/static/index.html <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PackRunner</title>
  </head>
  <body>
    <h1>PackRunner</h1>
    <div>
      <label>Pack:</label>
      <select id="packSelect"></select>
      <button id="refreshBtn" type="button">Refresh</button>
    </div>
    <div style="margin-top: 12px;">
      <label>Payload (JSON)</label><br/>
      <textarea id="payload" style="width: 100%; height: 140px;">{ "message": "hello" }</textarea>
    </div>
    <div style="margin-top: 12px;">
      <button id="runBtn" type="button">Run</button>
    </div>
    <pre id="result" style="margin-top: 12px; background:#111; color:#eee; padding:10px;"></pre>

    <script>
      const packSelect = document.getElementById("packSelect");
      const payloadEl = document.getElementById("payload");
      const resultEl = document.getElementById("result");
      const runBtn = document.getElementById("runBtn");
      const refreshBtn = document.getElementById("refreshBtn");

      function pretty(obj) { return JSON.stringify(obj, null, 2); }

      async function loadPacks() {
        const res = await fetch("/packs");
        const data = await res.json();
        packSelect.innerHTML = "";
        for (const p of data.packs || []) {
          const opt = document.createElement("option");
          opt.value = p;
          opt.textContent = p;
          packSelect.appendChild(opt);
        }
      }

      async function runPack() {
        resultEl.textContent = "Running...";
        let payload;
        try { payload = JSON.parse(payloadEl.value); }
        catch { resultEl.textContent = "Invalid JSON payload"; return; }

        const res = await fetch("/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pack_name: packSelect.value, payload }),
        });

        const data = await res.json();
        resultEl.textContent = pretty(data);
      }

      refreshBtn.addEventListener("click", loadPacks);
      runBtn.addEventListener("click", runPack);
      loadPacks();
    </script>
  </body>
</html>
HTML

cat > tests/test_runner.py <<'PY'
from packrunner.app.runner import runner


def test_echo():
    result = runner.execute("echo", {"hello": "world"})
    assert result["echo"]["hello"] == "world"
PY

cat > tests/test_api.py <<'PY'
from fastapi.testclient import TestClient
from packrunner.app.main import app


def test_list_packs():
    client = TestClient(app)
    resp = client.get("/packs")
    assert resp.status_code == 200
    assert "echo" in resp.json()["packs"]


def test_run_echo():
    client = TestClient(app)
    resp = client.post("/run", json={"pack_name": "echo", "payload": {"message": "hello"}})
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "success"
    assert body["result"]["echo"]["message"] == "hello"
PY

# 6) Run tests
pytest -q

# 7) Start server
echo ""
echo "Starting server at: http://127.0.0.1:8000/"
uvicorn packrunner.app.main:app --reload
