---
name: content
description: "마케팅 콘텐츠 파이프라인. /content recommend, /content research, /content plan, /content create, /content render, /content caption 서브커맨드로 추천→리서치→기획→HTML 제작→PNG 변환→캡션 단계를 순차 실행한다."
argument-hint: "<recommend|research|plan|create|render|caption> [주제/키워드] [--type tip-list|comparison]"
---

# Content

$ARGUMENTS에서 첫 번째 단어를 서브커맨드로 파싱한다.

```
서브커맨드 = $ARGUMENTS의 첫 단어
나머지 = $ARGUMENTS에서 첫 단어를 제외한 부분
```

서브커맨드가 `recommend`이면 → **Recommend 섹션** 실행
서브커맨드가 `research`이면 → **Research 섹션** 실행
서브커맨드가 `plan`이면 → **Plan 섹션** 실행
서브커맨드가 `create`이면 → **Create 섹션** 실행
서브커맨드가 `render`이면 → **Render 섹션** 실행
서브커맨드가 `caption`이면 → **Caption 섹션** 실행
서브커맨드가 없거나 불명확하면 → 오너에게 `recommend`, `research`, `plan`, `create`, `render`, `caption` 중 무엇인지 확인

---

## Recommend — 추천

보유자료 + 외부 트렌드 + 기존 콘텐츠 갭 분석을 종합하여 주제 후보를 추천한다.

### 에이전트

- recommender

### Input / Output

- **input**: 키워드 (선택)
- **output**: 콘솔 출력 (파일 저장 없음)

### 실행 절차

1. 프로젝트 루트 `.phase` 파일을 갱신한다:

   ```bash
   cat > .phase << 'PHASE_EOF'
   {"team":"marketing","version":"<version>","phase":"recommend","updated":"<ISO8601>"}
   PHASE_EOF
   ```

   - `<version>`: 현재 작업 버전 (BACKLOG.md 또는 plan.md 참조)
   - `<ISO8601>`: `date -u +"%Y-%m-%dT%H:%M:%SZ"` 출력값
2. 키워드 유무 확인
3. 키워드 없으면 `marketing/brand/tone.md` 존재 확인 (없으면 에러 처리)
4. recommender 에이전트에 전달할 컨텍스트 구성:
   - 키워드 (있으면)
   - 프로젝트 경로: `marketing/` (CWD 상대경로)
5. recommender 에이전트 실행
6. 에이전트 출력을 그대로 오너에게 전달

### 에러 처리

- brand/tone.md 없음 + 키워드도 없음: "키워드를 지정하거나 brand/tone.md를 먼저 작성하세요" 안내 후 중단

---

## Research — 리서치

주제를 리서치하여 research.md를 작성한다.

### 에이전트

- researcher

### Input / Output

- **input**: 주제 문자열 (인자)
- **output**: `marketing/content/{YYYY-MM-DD}-{주제슬러그}/research.md`

### 실행 절차

1. 프로젝트 루트 `.phase` 파일을 갱신한다:

   ```bash
   cat > .phase << 'PHASE_EOF'
   {"team":"marketing","version":"<version>","phase":"research","updated":"<ISO8601>"}
   PHASE_EOF
   ```

   - `<version>`: 현재 작업 버전 (BACKLOG.md 또는 plan.md 참조)
   - `<ISO8601>`: `date -u +"%Y-%m-%dT%H:%M:%SZ"` 출력값
2. 콘텐츠 폴더 생성: `marketing/content/{YYYY-MM-DD}-{주제슬러그}/`
3. `sources/` 폴더 확인 (오너가 미리 넣어둔 자료)
4. researcher 에이전트 실행
5. research.md 작성
6. 완료 안내: "리서치 완료. research.md 확인 후 /content plan 실행하세요"

### 에러 처리

- `sources/` 내 읽을 수 없는 파일: 해당 파일 스킵 + 경고 출력 후 계속 진행

---

## Plan — 기획

research.md를 바탕으로 슬라이드 기획안(plan.md)을 작성한다.

### 에이전트

- planner

### Input / Output

- **input**: 자동 감지 또는 `--folder {폴더명}` 명시, 선택: `--type tip-list|comparison`
- **output**: `{콘텐츠폴더}/{번호}/plan.md`

### 실행 절차

1. 프로젝트 루트 `.phase` 파일을 갱신한다:

   ```bash
   cat > .phase << 'PHASE_EOF'
   {"team":"marketing","version":"<version>","phase":"plan","updated":"<ISO8601>"}
   PHASE_EOF
   ```

   - `<version>`: 현재 작업 버전 (BACKLOG.md 또는 plan.md 참조)
   - `<ISO8601>`: `date -u +"%Y-%m-%dT%H:%M:%SZ"` 출력값
2. 폴더 자동 감지: research.md 있는 가장 최근 콘텐츠 폴더 감지 (아래 폴더 자동 감지 규칙 참조)
3. 콘텐츠 폴더 내 기존 번호 폴더(01, 02, ...) 확인 → 다음 번호 폴더 생성
4. `--type` 미지정 시 planner가 research.md 내용 기반으로 적합한 타입 판단
5. research.md + `marketing/brand/tone.md` + `marketing/templates/*.md` (조합 가이드) + `marketing/templates/layouts/` 참조
6. planner 에이전트 실행
7. `{번호}/plan.md` 작성
8. 완료 안내: "기획안 확인해주세요. 수정사항 있으면 말씀, 없으면 /content create"

### 에러 처리

- research.md 없음: "먼저 /content research를 실행하세요" 안내 후 중단
- 감지된 폴더 없음: "대상 콘텐츠 폴더가 없습니다. /content research를 먼저 실행하세요" 안내 후 중단

---

## Create — 제작

plan.md 기반으로 슬라이드 HTML을 생성한다.

### 에이전트

- maker

### Input / Output

- **input**: 자동 감지 또는 `--folder {폴더명}` 명시
- **output**:
  - `{콘텐츠폴더}/{번호}/slides/slide-{N}.html`

### 실행 절차

1. 프로젝트 루트 `.phase` 파일을 갱신한다:

   ```bash
   cat > .phase << 'PHASE_EOF'
   {"team":"marketing","version":"<version>","phase":"create","updated":"<ISO8601>"}
   PHASE_EOF
   ```

   - `<version>`: 현재 작업 버전 (BACKLOG.md 또는 plan.md 참조)
   - `<ISO8601>`: `date -u +"%Y-%m-%dT%H:%M:%SZ"` 출력값
2. 폴더 자동 감지: 콘텐츠 폴더 내 `{번호}/plan.md` 있고 `{번호}/slides/` 없는 최신 번호 폴더 감지 (아래 폴더 자동 감지 규칙 참조)
3. plan.md + `marketing/brand/design-tokens.css` + `marketing/templates/layouts/` 참조
4. maker 에이전트 실행
5. `{번호}/slides/*.html` 생성
6. 완료 안내: "HTML 생성 완료. 브라우저에서 확인 후 /content render 실행하세요"

### 에러 처리

- plan.md 없음: "먼저 /content plan을 실행하세요" 안내 후 중단

---

## Render — PNG 변환

slides/*.html을 PNG로 변환한다. 스킬이 직접 Bash로 render.js를 호출하며 에이전트 위임 없음.

### 에이전트

- 없음 (스킬 직접 실행)

### Input / Output

- **input**: 자동 감지 또는 `--folder {폴더명}` 명시
- **output**:
  - `{콘텐츠폴더}/{번호}/output/slide-{N}.png` (PNG 변환 결과, 1080×1440px)

### 실행 절차

1. 프로젝트 루트 `.phase` 파일을 갱신한다:

   ```bash
   cat > .phase << 'PHASE_EOF'
   {"team":"marketing","version":"<version>","phase":"render","updated":"<ISO8601>"}
   PHASE_EOF
   ```

   - `<version>`: 현재 작업 버전 (BACKLOG.md 또는 plan.md 참조)
   - `<ISO8601>`: `date -u +"%Y-%m-%dT%H:%M:%SZ"` 출력값
2. 폴더 자동 감지: 콘텐츠 폴더 내 `{번호}/slides/` 있고 `{번호}/output/` 없는 최신 번호 폴더 감지 (아래 폴더 자동 감지 규칙 참조)
3. Playwright 설치 확인 (`marketing/node_modules` 존재 여부)
4. `slides/*.html` 목록 취득 (파일명 오름차순)
5. 각 HTML에 대해 `node {PLUGIN_DIR}/scripts/render.js {html경로} {png경로} --width 1080 --height 1440` Bash 호출
6. `.phase`의 phase를 `"done"`으로 갱신한다:

   ```bash
   cat > .phase << 'PHASE_EOF'
   {"team":"marketing","version":"<version>","phase":"done","updated":"<ISO8601>"}
   PHASE_EOF
   ```
7. 완료 안내: "PNG 변환 완료. output/ 폴더에서 결과 확인하세요"

### 에러 처리

- slides/ 없음: "먼저 /content create를 실행하세요" 안내 후 중단
- Playwright 미설치: "marketing 프로젝트에서 npm install 실행 필요" 안내 후 중단
- 웹폰트 로딩 실패: fallback 폰트(system sans-serif)로 렌더링 + 경고 출력
- render.js 실행 실패 (개별 슬라이드): 실패 파일 로그 출력 + 나머지 계속 변환

---

## Caption — 인스타그램 캡션

plan.md 기반으로 인스타그램 캡션을 작성한다. render 완료 여부와 무관하게 plan.md만 있으면 실행 가능.

### 에이전트

- writer

### Input / Output

- **input**: 자동 감지 또는 `--folder {폴더명}` 명시
- **output**: `{콘텐츠폴더}/{번호}/caption.md`

### 실행 절차

1. 프로젝트 루트 `.phase` 파일을 갱신한다:

   ```bash
   cat > .phase << 'PHASE_EOF'
   {"team":"marketing","version":"<version>","phase":"caption","updated":"<ISO8601>"}
   PHASE_EOF
   ```

   - `<version>`: 현재 작업 버전 (BACKLOG.md 또는 plan.md 참조)
   - `<ISO8601>`: `date -u +"%Y-%m-%dT%H:%M:%SZ"` 출력값
2. 폴더 자동 감지: 콘텐츠 폴더 내 `{번호}/plan.md` 있는 가장 큰 번호 폴더 감지 (아래 폴더 자동 감지 규칙 참조)
3. plan.md + `marketing/brand/tone.md` 참조
4. writer 에이전트 실행
5. `{번호}/caption.md` 작성
6. 완료 안내: "캡션 작성 완료. caption.md 확인 후 수정사항 있으면 말씀해주세요"

### 에러 처리

- plan.md 없음: "먼저 /content plan을 실행하세요" 안내 후 중단
- brand/tone.md 없음: 경고 출력 후 기본 톤으로 진행

---

## 폴더 자동 감지 규칙

`/content plan`, `/content create`, `/content render`, `/content caption`은 대상 폴더를 자동 감지한다.

| 스킬 | 감지 조건 |
|------|----------|
| /content plan | `research.md` 있는 가장 최근 날짜 콘텐츠 폴더 → 그 안에서 다음 번호 폴더 생성 |
| /content create | 콘텐츠 폴더 내 `{번호}/plan.md` 있고 `{번호}/slides/` 없는 가장 큰 번호 폴더 |
| /content render | 콘텐츠 폴더 내 `{번호}/slides/` 있고 `{번호}/output/` 없는 가장 큰 번호 폴더 |
| /content caption | 콘텐츠 폴더 내 `{번호}/plan.md` 있는 가장 큰 번호 폴더 |

- 콘텐츠 폴더 날짜 기준: 폴더명 앞 `YYYY-MM-DD` 접두사
- 번호 폴더: 2자리 숫자 (01, 02, 03, ...) — 없으면 01부터 시작
- 다중 콘텐츠 폴더 매칭 시: 가장 최근 날짜 폴더 선택 + "여러 폴더 감지됨, {폴더명} 선택" 안내
- 명시적 지정: `--folder {폴더명}` 인자로 자동 감지 우회 가능

---

## 승인 게이트

`/content plan` 완료 후 `/content create` 실행 전에 오너가 plan.md를 확인한다.

- **plan.md 직접 편집 후 `/content create`**: maker는 최종 plan.md 그대로 반영
- **피드백 텍스트 전달 후 `/content plan` 재실행**: planner가 피드백 반영하여 plan.md 재작성
- **그대로 승인 후 `/content create`**: 변경 없이 제작 진행
