# A_Escort — 高端預約平台（Next.js）

Mobile-First 暗黑金質感預約平台，使用 Next.js 16（App Router）+ React 19 + TypeScript + Tailwind CSS v4 建構。

## 技術棧

| 項目 | 版本 |
|------|------|
| Next.js | 16.4.0（App Router、Turbopack） |
| React | 19.3.0 |
| TypeScript | 5.x |
| Tailwind CSS | v4 |
| ESLint | 9 + eslint-config-next |

## 本機開發

```bash
# 1. 安裝依賴（只需做一次）
npm install

# 2. 啟動開發伺服器
npm run dev
```

用瀏覽器開啟 <http://localhost:3000> 查看結果。

```bash
# 建置（部署前驗證用）
npm run build

# 型別檢查 / Lint
npx tsc --noEmit
npx eslint app components types data --max-warnings 0
```

## 專案結構

```text
app/
  page.tsx                 # 首頁（含篩選連動）
  product/[id]/page.tsx    # 詳細介紹頁（動態路由）
  product/[id]/not-found.tsx  # 找不到對象時的提示畫面
components/
  FilterSection.tsx        # 跑馬燈 + 篩選入口列
  FilterModal.tsx          # 底部滑出式篩選彈窗
  GirlCard.tsx             # 佳人圖卡
  ImageCarousel.tsx        # 詳細頁多圖輪播
types/index.ts             # Girl / PricingPlan / FilterState 型別
data/mockData.ts           # 模擬資料庫（pricing、reviews、LINE/TG 連結）
public/girls/              # 佳人佔位圖（上線前替換為真實照片）
public/reviews/            # 客評截圖佔位圖（後端上傳真圖替換即可）
```

---

## 如何將本專案上傳至 GitHub

> 以下步驟以 **Windows + PowerShell + VS Code** 為例，專案目前在 `main` 分支且**尚未綁定遠端**，照著做一次即可。

### 步驟 0：上傳前先檢查（在本專案目錄執行）

```powershell
# 確認目前分支與未提交的變更
git status --short --branch

# 確認是否已綁定遠端（目前應無輸出，代表還沒綁）
git remote -v
```

`.gitignore` 已排除 `node_modules/`、`.next/`、`*.tsbuildinfo`、`.env*`，
所以直接上傳即可，不會把依賴或建置產物推上去。

### 步驟 1：在 GitHub 建立一個「空」儲存庫

1. 登入 <https://github.com>，點右上角 `+` → **New repository**。
2. **Repository name**：例如 `a-escort-web`（自訂，需與 `package.json` 的 `name` 同為全小寫）。
3. **Public / Private**：依需求選（上線專案建議先 Private）。
4. ⚠️ **不要勾選** `Add a README file`、`Add .gitignore`、`Choose a license`——
   保持完全空白，否則第一次推送會衝突。
5. 按 **Create repository**，記下頁面顯示的 HTTPS 網址，例如：

```text
https://github.com/<你的帳號>/a-escort-web.git
```

### 步驟 2：把目前的變更先提交到本機

```powershell
# 切到專案根目錄（依你的實際路徑調整）
cd C:\Users\Ren\Desktop\A_Escort

# 確認分支是 main（若顯示 master，見下方常見問題）
git branch --show-current

# 加入所有變更（含新增的 public/reviews/）
git add -A

# 提交（訊息可自訂）
git commit -m "feat: 新增詳細頁基礎消費與客評截圖區塊"
```

### 步驟 3：綁定遠端並第一次推送

> 下方 `<你的帳號>` 請換成你自己的 GitHub 帳號。

```powershell
# 綁定遠端（只需做一次）
git remote add origin https://github.com/<你的帳號>/a-escort-web.git

# 確認有綁上
git remote -v

# 第一次推送，並把本機 main 與遠端 main 綁定
git push -u origin main
```

推送成功後，重新整理 GitHub 頁面就會看到所有檔案。

之後若 GitHub 要求登入，請使用 **Personal Access Token（PAT）** 當作密碼，
帳號密碼登入已不支援 HTTPS 推送（申請方式見下方常見問題）。

### 步驟 4：之後的日常更新流程

```powershell
# 1. 先看改了什麼
git status --short

# 2. 全部加入並提交
git add -A
git commit -m "feat: 說明本次修改內容"

# 3. 推上 GitHub（第一次已用過 -u，之後不用再加）
git push
```

### 常見問題

| 狀況 | 解法 |
|------|------|
| `remote origin already exists` | 已綁過遠端，直接 `git remote -v` 確認網址；要換網址用 `git remote set-url origin <新網址>` |
| 分支是 `master` 不是 `main` | `git branch -M main` 改名後再 `git push -u origin main` |
| `failed to push` / 遠端有你沒有的提交 | 先 `git pull --rebase origin main` 合併後再 `git push`（前提是遠端是空 repo 時不應發生） |
| 推送時要求帳密 / `Authentication failed` | GitHub 已停用密碼推送，需申請 PAT：GitHub 右上頭像 → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token**，勾選 `repo` 權限，推送時把 Token 貼在密碼欄 |
| 不小心推了 `node_modules` | 正常情況下不會（已被 `.gitignore` 排除）。若已發生：`git rm -r --cached node_modules` 後重新提交 |
| 換電腦要接著開發 | `git clone https://github.com/<你的帳號>/a-escort-web.git` → `cd a-escort-web` → `npm install` → `npm run dev` |

### 從 Vercel 直接部署（可選）

1. 上傳到 GitHub 後，前往 <https://vercel.com/new> 用 GitHub 登入。
2. **Import** 剛才的儲存庫，一路預設值即可（Framework 會自動偵測為 Next.js）。
3. 按 **Deploy**，之後每次 `git push` 到 GitHub，Vercel 會自動重新部署。

