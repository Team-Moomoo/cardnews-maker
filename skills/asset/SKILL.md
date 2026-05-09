---
name: asset
description: "에셋 관리 — inbox 정리 및 에셋 목록 조회"
argument-hint: "<organize|list> [--tags 'tag']"
---

# Asset

$ARGUMENTS에서 첫 번째 단어를 서브커맨드로 파싱한다.

```
서브커맨드 = $ARGUMENTS의 첫 단어
나머지 = $ARGUMENTS에서 첫 단어를 제외한 부분
```

서브커맨드가 `organize`이면 → **Organize 섹션** 실행
서브커맨드가 `list`이면 → **List 섹션** 실행
서브커맨드가 없거나 불명확하면 → 오너에게 `organize`, `list` 중 무엇인지 확인

---

## Organize — inbox 정리

`assets/inbox/`에 있는 파일을 분석하여 `photos/`, `screenshots/`, 또는 `articles/`로 분류·이동한다.

### Input / Output

- **input**: 없음
- **output**:
  - 파일 이동: `marketing/assets/photos/{파일명}`, `marketing/assets/screenshots/{파일명}`, 또는 `marketing/assets/articles/{파일명}`
  - index.md 업데이트: `marketing/assets/photos/index.md`, `marketing/assets/screenshots/index.md`, `marketing/assets/articles/index.md`

### 실행 절차

1. `marketing/assets/inbox/` 폴더 존재 확인 (없으면 에러 처리 → 중단)
2. `assets/inbox/` 내 파일 목록 스캔
3. inbox가 비어있으면 "inbox에 파일이 없습니다" 안내 후 중단
4. 각 파일을 Read 도구로 읽어서 AI 분석:
   - **이미지 파일** (.jpg, .png, .webp 등):
     - 사진 vs 스크린샷 자동 판별 (사진: 자연/인물/사물 등 실사 이미지, 스크린샷: UI 화면 캡처)
     - 태그 생성 (내용 기반 키워드 2~5개)
     - 분위기 생성 (밝음/어두움/따뜻함/차가움/미니멀/풍부함 등)
     - 추천 용도 생성 (배경/포인트/아이콘 등)
     - 사진이면 촬영자/출처 정보 수집:
       - 파일명에 Unsplash URL 또는 ID가 포함되어 있으면 WebFetch로 해당 페이지 메타데이터 파싱 시도
       - 파싱 실패 시 오너에게 촬영자/출처 수동 입력 요청
   - **텍스트/마크다운 파일** (.md, .txt, .url 등):
     - 기사/스크랩으로 분류
     - 제목, URL(있으면), 요약, 태그 추출
5. 분류에 따라 이동:
   - 사진 → `assets/photos/{파일명}` (Bash mv 사용)
   - 스크린샷 → `assets/screenshots/{파일명}` (Bash mv 사용)
   - 기사/스크랩 → `assets/articles/{파일명}` (Bash mv 사용)
6. 해당 `index.md` 행 추가:
   - `assets/photos/index.md` 없으면 자동 생성 (헤더 행 포함)
   - `assets/screenshots/index.md` 없으면 자동 생성 (헤더 행 포함)
   - `assets/articles/index.md` 없으면 자동 생성 (헤더 행 포함)
   - photos index.md에 행 추가: `| {파일명} | {설명} | {태그} | {분위기} | {추천 용도} | {촬영자} | {출처} |`
   - screenshots index.md에 행 추가: `| {화면명} | {파일명} | {설명} | {캡처일} | {앱 버전} |`
   - articles index.md에 행 추가: `| {파일명} | {제목} | {URL} | {요약} | {태그} | {수집일} |`
7. inbox에서 파일 제거 (이동 완료 확인 후 → 파일이 대상 폴더에 존재하면 inbox에서 삭제)
8. 결과 요약 출력:
   ```
   ## 에셋 정리 완료
   - 처리: N개
   - 사진: N개 → assets/photos/
   - 스크린샷: N개 → assets/screenshots/
   - 기사: N개 → assets/articles/
   - 스킵: N개 (지원 안 되는 형식)
   ```

### 에러 처리

| 상황 | 대응 |
|------|------|
| `assets/inbox/` 폴더 없음 | "assets/inbox/ 폴더를 먼저 생성하세요" 안내 후 중단 |
| 지원 안 되는 파일 형식 (.pdf 등) | 해당 파일 스킵 + 경고 출력 후 나머지 계속 처리 |
| `index.md` 없음 | 헤더 행 포함 자동 생성 후 계속 진행 |
| Unsplash 메타데이터 파싱 실패 | 오너에게 촬영자/출처 수동 입력 요청 |

---

## List — 에셋 목록 조회

현재 등록된 에셋 목록을 출력한다. 태그 필터 적용 가능.

### Input / Output

- **input**:
  - 선택: `--tags "태그"` (태그 필터, 복수 지정 시 OR 조건)
- **output**: 콘솔 출력 (에셋 수 + 태그별 분포 요약 + 목록)

### 실행 절차

1. `marketing/assets/photos/index.md` 읽기 (없으면 "사진 없음" 처리)
2. `marketing/assets/screenshots/index.md` 읽기 (없으면 "스크린샷 없음" 처리)
3. `marketing/assets/articles/index.md` 읽기 (없으면 "기사 없음" 처리)
4. `--tags` 필터 있으면 해당 태그를 포함하는 행만 필터링 (대소문자 구분 없음)
5. 결과 출력:
   ```
   ## 에셋 목록
   **사진** (N개)
   | 파일명 | 설명 | 태그 | 분위기 | 추천 용도 | 촬영자 |
   |--------|------|------|--------|----------|--------|
   ...

   **스크린샷** (N개)
   | 화면명 | 파일명 | 설명 | 캡처일 |
   |--------|--------|------|--------|
   ...

   **기사** (N개)
   | 파일명 | 제목 | URL | 요약 | 태그 | 수집일 |
   |--------|------|-----|------|------|--------|
   ...

   **태그별 분포**
   - {태그}: N개
   ...
   ```
6. `--tags` 필터 결과가 0건이면 "해당 태그의 에셋이 없습니다" 안내

### 에러 처리

| 상황 | 대응 |
|------|------|
| `assets/photos/index.md`, `assets/screenshots/index.md`, `assets/articles/index.md` 모두 없음 | "등록된 에셋이 없습니다. /asset organize를 먼저 실행하세요" 안내 |
