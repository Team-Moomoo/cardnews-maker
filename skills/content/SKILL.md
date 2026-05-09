---
name: content
description: "카드뉴스 콘텐츠 파이프라인. /content research, /content plan, /content create, /content render, /content caption 서브커맨드로 리서치→기획→HTML 제작→PNG 변환→캡션 단계를 순차 실행한다."
argument-hint: "<research|plan|create|render|caption> [주제] [--type tip-list|comparison]"
---

# Content

> **강의 데모용.** 브랜드 reference·산출물 template은 모두 플러그인 내장이다.
> - `${CLAUDE_PLUGIN_ROOT}/skills/content/reference/` — 톤(`tone.md`), 디자인 토큰(`design-tokens.css`), 로고(`logo.svg`), 조합 가이드(`comparison.md`)
> - `${CLAUDE_PLUGIN_ROOT}/skills/content/template/` — 산출 양식(`research.md`, `plan.md`) + 슬라이드 레이아웃(`layouts/*.html`)
>
> 각 단계 에이전트는 위 경로의 자료만 참조한다. 워크스페이스(CWD)에는 산출물(`content/`)만 쌓인다.

$ARGUMENTS에서 첫 번째 단어를 서브커맨드로 파싱한다.

```
서브커맨드 = $ARGUMENTS의 첫 단어
나머지 = $ARGUMENTS에서 첫 단어를 제외한 부분
```

서브커맨드가 `research`이면 → **Research 섹션** 실행
서브커맨드가 `plan`이면 → **Plan 섹션** 실행
서브커맨드가 `create`이면 → **Create 섹션** 실행
서브커맨드가 `render`이면 → **Render 섹션** 실행
서브커맨드가 `caption`이면 → **Caption 섹션** 실행
서브커맨드가 없거나 불명확하면 → 오너에게 `research`, `plan`, `create`, `render`, `caption` 중 무엇인지 확인

---

## Research — 리서치

주제를 리서치하여 research.md를 작성한다.

### 에이전트

- researcher

### Input / Output

- **input**: 주제 문자열 (인자)
- **output**: `content/{YYYY-MM-DD}-{주제슬러그}/research.md` (CWD 상대경로)

### 실행 절차

1. 콘텐츠 폴더 생성: `content/{YYYY-MM-DD}-{주제슬러그}/` (CWD 루트의 `content/` 밑)
2. researcher 에이전트 실행 — 컨텍스트로 `${CLAUDE_PLUGIN_ROOT}/skills/content/template/research.md` (산출 양식) 전달
3. research.md 작성 (template/research.md 구조 그대로)
4. 완료 안내: "리서치 완료. research.md 확인 후 /content plan 실행하세요"

### 에러 처리

- 웹 검색 실패: 에이전트가 부분 결과 + 경고로 작성

---

## Plan — 기획

research.md를 바탕으로 슬라이드 기획안(plan.md)을 작성한다.

### 에이전트

- planner

### Input / Output

- **input**: 자동 감지 또는 `--folder {폴더명}` 명시, 선택: `--type tip-list|comparison`
- **output**: `{콘텐츠폴더}/{번호}/plan.md`

### 실행 절차

1. 폴더 자동 감지: research.md 있는 가장 최근 콘텐츠 폴더 감지 (아래 폴더 자동 감지 규칙 참조)
2. 콘텐츠 폴더 내 기존 번호 폴더(01, 02, ...) 확인 → 다음 번호 폴더 생성
3. `--type` 미지정 시 planner가 research.md 내용 기반으로 적합한 타입 판단
4. research.md + `${CLAUDE_PLUGIN_ROOT}/skills/content/reference/tone.md` + `${CLAUDE_PLUGIN_ROOT}/skills/content/reference/comparison.md` (조합 가이드) + `${CLAUDE_PLUGIN_ROOT}/skills/content/template/plan.md` (산출 양식) + `${CLAUDE_PLUGIN_ROOT}/skills/content/template/layouts/` 참조
5. planner 에이전트 실행
6. `{번호}/plan.md` 작성 (template/plan.md 구조 그대로)
7. 완료 안내: "기획안 확인해주세요. 수정사항 있으면 말씀, 없으면 /content create"

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

1. 폴더 자동 감지: 콘텐츠 폴더 내 `{번호}/plan.md` 있고 `{번호}/slides/` 없는 최신 번호 폴더 감지 (아래 폴더 자동 감지 규칙 참조)
2. plan.md + `${CLAUDE_PLUGIN_ROOT}/skills/content/reference/design-tokens.css` + `${CLAUDE_PLUGIN_ROOT}/skills/content/reference/logo.svg` + `${CLAUDE_PLUGIN_ROOT}/skills/content/template/layouts/` 참조
3. maker 에이전트 실행
4. `{번호}/slides/*.html` 생성
5. 완료 안내: "HTML 생성 완료. 브라우저에서 확인 후 /content render 실행하세요"

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

1. 폴더 자동 감지: 콘텐츠 폴더 내 `{번호}/slides/` 있고 `{번호}/output/` 없는 최신 번호 폴더 감지 (아래 폴더 자동 감지 규칙 참조)
2. Playwright 설치 확인 (CWD `node_modules` 존재 여부)
3. `slides/*.html` 목록 취득 (파일명 오름차순)
4. 각 HTML에 대해 `node ${CLAUDE_PLUGIN_ROOT}/scripts/render.js {html경로} {png경로} --width 1080 --height 1440` Bash 호출
5. 완료 안내: "PNG 변환 완료. output/ 폴더에서 결과 확인하세요"

### 에러 처리

- slides/ 없음: "먼저 /content create를 실행하세요" 안내 후 중단
- Playwright 미설치: "CWD에서 npm install playwright 실행 필요" 안내 후 중단
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

1. 폴더 자동 감지: 콘텐츠 폴더 내 `{번호}/plan.md` 있는 가장 큰 번호 폴더 감지 (아래 폴더 자동 감지 규칙 참조)
2. plan.md + `${CLAUDE_PLUGIN_ROOT}/skills/content/reference/tone.md` 참조
3. writer 에이전트 실행
4. `{번호}/caption.md` 작성
5. 완료 안내: "캡션 작성 완료. caption.md 확인 후 수정사항 있으면 말씀해주세요"

### 에러 처리

- plan.md 없음: "먼저 /content plan을 실행하세요" 안내 후 중단

---

## 폴더 자동 감지 규칙

`/content plan`, `/content create`, `/content render`, `/content caption`은 대상 폴더를 자동 감지한다. 기준 경로는 CWD의 `content/`.

| 스킬 | 감지 조건 |
|------|----------|
| /content plan | `content/*/research.md` 있는 가장 최근 날짜 콘텐츠 폴더 → 그 안에서 다음 번호 폴더 생성 |
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
