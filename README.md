# 和弦研究室 V2.1 預覽

由完整 V2 `2.0.0-preview.2` 原始碼開發，不是從 GitHub v1.4.1 重建。V2 與正式 GitHub Pages 保持不變。

## 開發與建置

Buildless HTML/JS，沒有 npm 相依。以任意靜態 HTTP 伺服器開啟根目錄；HTTPS 才能使用麥克風/PWA。

```sh
python scripts/build-static.py
node tests/chord-engine.test.cjs
node tests/harmony.test.cjs
node tests/poly.test.cjs
node tests/service-worker.test.cjs
python tests/sampled-piano.py
```

`dist/` 是發布資產；測試 harness 不應放入發布包。`tests/browser-regression.js` 需載入在 app scripts 之後；`tests/responsive.html` 可複製到 dev dist 執行。

- `js/legacy-1.js`–`legacy-4.js`：保留原引擎、音訊、歌詞/編排、教學、PWA。
- `js/piano-samples.js`：原鋼琴取樣。
- `js/chord-engine.js`：V2 結構化組裝與拼寫。
- `js/harmony-engine.js`：統一記譜及可解釋和聲推定。
- `js/poly-engine.js`：無目標答案偏置的實驗性多音偵測、穩定窗與集合/低音驗證。
- `js/ui-v21.js` / `css/ui-v21.css`：V2.1 共用介面與功能整合。
- `docs/DESIGN_DECISIONS_V2.1.md`：可靠設計依據，後續修改必須同步。
- `docs/POLYPHONIC_TEST_PLAN.md`：實機驗證矩陣與已知限制。

## 部署與回退

V2.1 project ID 以 `.openai/hosting.json` 為準；透過 Sites source helper 同步此 repository、產生靜態封裝，再作 owner-private 部署。不能使用原 V2 project ID。

原 V2 發行來源 `a3c52e6ae0accec33b6e3d040afb37d68118690a`，原網址不動。此 repository 的 `v2-baseline` tag 是修改前應用基準。要回退先建立分支/工作樹檢查該 tag，僅部署至 V2.1；不要將新專案 manifest 寫到 V2 或 GitHub Pages。也可直接使用保留的 V2 網址。

新 origin 不共享原站本機儲存；從 V2 匯出編排 JSON／歌詞專案，於 V2.1 匯入。既有 schema 及 pattern ID 保留；新選填拼寫欄位不影響舊站播放。
