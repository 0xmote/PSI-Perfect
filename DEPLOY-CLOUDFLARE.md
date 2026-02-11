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

## "Deploying to Cloudflare's global network"에서 실패하는 경우

빌드는 성공했는데 **배포 단계만** 실패한다면, 대시보드에서 **Build output directory**가 비어 있거나 잘못된 값일 가능성이 큽니다. Git 연동 배포는 이 값을 대시보드에서만 읽습니다.

### 해결 방법

1. **Cloudflare 대시보드** → **Workers & Pages** → 해당 **Pages 프로젝트** 선택
2. **Settings** 탭 → **Builds & deployments** 섹션
3. **Build configurations**에서 **Edit configuration** (또는 프로젝트 생성 시 빌드 설정)
4. 다음을 확인/수정:
   - **Framework preset**: **Next.js (Static HTML Export)** 선택  
     (이 프리셋이 Build output directory를 `out`으로 설정합니다)
   - **Build command**: `npm run build`
   - **Build output directory**: **`out`** 으로 반드시 입력 (비워두지 말 것)
5. **Save** 후 **Retry deployment** 또는 새 커밋 푸시로 재배포

프리셋을 바꾼 뒤에도 **Build output directory** 필드가 비어 있으면 수동으로 `out`을 입력해야 합니다.

---

## 참고

- **빌드 출력 디렉터리**: Next.js `output: 'export'` 사용 시 기본값은 `out`입니다.
- **이미지**: `next.config.ts`에 `images: { unoptimized: true }`가 설정되어 있어 정적 호스팅에 적합합니다.
- **커스텀 도메인**: Cloudflare Pages 프로젝트 → **Custom domains**에서 설정할 수 있습니다.
