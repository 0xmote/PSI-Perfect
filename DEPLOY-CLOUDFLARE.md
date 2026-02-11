# Cloudflare Pages 배포 가이드

이 프로젝트는 Next.js 정적 내보내기(`output: 'export'`)를 사용하므로 **Cloudflare Pages**에 그대로 배포할 수 있습니다.

## 방법 1: Cloudflare 대시보드 (Git 연동, 추천)

1. **Cloudflare 대시보드** → [Pages](https://dash.cloudflare.com/?to=/:account/pages) → **Create a project** → **Connect to Git**
2. 저장소 선택 후 **Begin setup**
3. **Build 설정**:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: (비워두기)
   - **Environment variables**: 필요 시 추가 (예: `NODE_VERSION = 20`)
4. **Save and Deploy** 클릭

이후 푸시할 때마다 자동으로 빌드·배포됩니다.

---

## 방법 2: Wrangler CLI (직접 업로드)

로컬에서 빌드한 뒤 `out` 폴더만 업로드하는 방식입니다.

### 1. Wrangler 설치 및 로그인

```bash
npm install -g wrangler
wrangler login
```

### 2. 프로젝트 빌드

```bash
npm run build
```

### 3. Pages 프로젝트 생성 후 배포

```bash
# 최초 1회: Pages 프로젝트 생성
npx wrangler pages project create psi-perfect

# 배포 (이후 배포할 때마다 실행)
npx wrangler pages deploy out --project-name=psi-perfect
```

`--project-name`은 대시보드에서 만든 프로젝트 이름과 맞추면 됩니다.

---

## 자산 디렉터리를 찾을 수 없다는 에러가 나는 경우

에러 메시지에 "assets directory" 또는 "Failed: error occurred while running deploy command"가 보이면, Wrangler가 정적 파일이 있는 폴더를 못 찾는 상황입니다. 이 프로젝트에는 **`wrangler.jsonc`**가 포함되어 있어 `pages_build_output_dir`가 `./out`으로 설정되어 있습니다.  
대시보드에서 **Build output directory**를 **`out`**으로 설정했는지 한 번 더 확인한 뒤 재배포해 보세요.

---

## 참고

- **빌드 출력 디렉터리**: Next.js `output: 'export'` 사용 시 기본값은 `out`입니다.
- **이미지**: `next.config.ts`에 `images: { unoptimized: true }`가 설정되어 있어 정적 호스팅에 적합합니다.
- **커스텀 도메인**: Cloudflare Pages 프로젝트 → **Custom domains**에서 설정할 수 있습니다.
