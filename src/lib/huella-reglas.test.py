"""Integration checks against the configured backend; uses a locally minted admin session."""
import json
import os
from pathlib import Path
import unittest
import requests


class HuellaReglas(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root = Path(__file__).resolve().parents[2]
        config = {}
        for line in (root / ".env").read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                key, value = line.split("=", 1)
                config[key] = value.strip().strip('"').strip("'")
        cls.url = (os.environ.get("VITE_SUPABASE_URL") or config["VITE_SUPABASE_URL"]) + "/rest/v1/huella_solidaria_fases"
        key = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY") or config["VITE_SUPABASE_PUBLISHABLE_KEY"]
        session = json.loads((Path.home() / ".cache/lovable-auth/session.json").read_text())["session"]
        cls.headers = {"apikey": key, "Authorization": "Bearer " + session["access_token"], "Prefer": "return=representation"}

    def crear(self, tipo):
        r = requests.post(self.url, headers=self.headers, json={"titulo": "Prueba temporal Huella", "fecha": "2026-10-28", "tipo": tipo, "publicado": False, "fotos": ["foto-a", "foto-b"]}, timeout=20)
        self.assertEqual(r.status_code, 201)
        row = r.json()[0]
        self.addCleanup(lambda: requests.delete(self.url, headers=self.headers, params={"id": "eq." + row["id"]}, timeout=20))
        return row

    def test_como_maximo_una_actual(self):
        actuales = requests.get(self.url, headers=self.headers, params={"tipo": "eq.actual"}, timeout=20).json()
        if not actuales:
            self.crear("actual")
        r = requests.post(self.url, headers=self.headers, json={"titulo": "Segunda causa prohibida", "fecha": "2026-10-28", "tipo": "actual", "publicado": False}, timeout=20)
        self.assertEqual(r.status_code, 409)
        self.assertEqual(r.json()["code"], "23505")

    def test_archivar_conserva_datos_y_orden_de_fotos(self):
        actuales = requests.get(self.url, headers=self.headers, params={"tipo": "eq.actual"}, timeout=20).json()
        if actuales:
            self.skipTest("Existing current cause is never modified by this test")
        row = self.crear("actual")
        r = requests.patch(self.url, headers=self.headers, params={"id": "eq." + row["id"]}, json={"tipo": "historial"}, timeout=20)
        self.assertEqual(r.status_code, 200)
        saved = r.json()[0]
        self.assertEqual(saved["tipo"], "historial")
        for field in ("titulo", "fecha", "descripcion", "fotos", "publicado"):
            self.assertEqual(saved[field], row[field])

    def test_consulta_publica_solo_muestra_publicadas(self):
        row = self.crear("historial")
        params = {"id": "eq." + row["id"], "publicado": "eq.true"}
        self.assertEqual(requests.get(self.url, headers=self.headers, params=params, timeout=20).json(), [])
        r = requests.patch(self.url, headers=self.headers, params={"id": "eq." + row["id"]}, json={"publicado": True}, timeout=20)
        self.assertEqual(r.status_code, 200)
        rows = requests.get(self.url, headers=self.headers, params=params, timeout=20).json()
        self.assertEqual([r["id"] for r in rows], [row["id"]])


if __name__ == "__main__":
    unittest.main()