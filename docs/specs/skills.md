---
last-updated: 2026-03-29
---

# Skills

team-marketing 플러그인의 스킬 정의. 콘텐츠 제작 파이프라인의 각 단계를 실행하는 진입점.

## 파이프라인 매핑

```
⓪ 추천     /content recommend "키워드"  → 콘솔 출력
① 리서치   /content research "주제"     → research.md
② 기획     /content plan               → plan.md  (승인 게이트)
③ 제작     /content create             → slides/*.html
④ 변환     /content render             → output/*.png
⑤ 캡션     /content caption            → caption.md
```

## 스킬 목록

### /content recommend

보유자료 + 외부 트렌드 + 기존 콘텐츠 갭 분석으로 주제 후보를 추천한다.

- **에이전트**: recommender
- **input**:
  - 선택: 키워드 문자열 (인자)
- **output**: 콘솔 출력 (파일 저장 없음)
- **실행 절차**:
  1. 키워드 유무 확인
  2. 키워드 없으면 `marketing/brand/tone.md` 존재 확인 (없으면 에러 처리)
  3. recommender 에이전트 실행
  4. 에이전트 출력을 오너에게 전달
- **에러 처리**:
  - brand/tone.md 없음 + 키워드도 없음: "키워드를 지정하거나 brand/tone.md를 먼저 작성하세요" 안내 후 중단
  - 웹 검색 실패: 보유자료 + 기존 콘텐츠 기반으로만 추천 + 경고 출력
  - 보유자료 없음: 트렌드 + 갭 분석만으로 추천
  - 기존 콘텐츠 없음: 갭 분석 스킵, 트렌드 + 보유자료 기반으로만 추천

### /content research

주제를 리서치하여 research.md를 작성한다.

- **에이전트**: researcher
- **input**:
  - 필수: 주제 문자열 (인자)
- **output**: `marketing/content/{날짜}-{주제슬러그}/research.md`
- **실행 절차**:
  1. 콘텐츠 폴더 생성: `marketing/content/{YYYY-MM-DD}-{주제슬러그}/`
  2. `sources/` 폴더 확인 (오너가 미리 넣어둔 자료)
  3. researcher 에이전트 실행
  4. research.md 작성
  5. 완료 안내: "리서치 완료. research.md 확인 후 /content plan 실행하세요"
- **에러 처리**:
  - `sources/` 내 읽을 수 없는 파일: 해당 파일 스킵 + 경고 출력 후 계속 진행

### /content plan

research.md를 바탕으로 슬라이드 기획안(plan.md)을 작성한다.

- **에이전트**: planner
- **input**:
  - 자동 감지 또는 `--folder {폴더명}` 명시
  - 선택: `--type tip-list|comparison` (미지정 시 planner가 research.md 보고 판단)
- **output**: `{콘텐츠폴더}/{번호}/plan.md`
- **실행 절차**:
  1. 폴더 자동 감지: research.md 있는 가장 최근 콘텐츠 폴더 감지 (아래 규칙 참조)
  2. 콘텐츠 폴더 내 기존 번호 폴더(01, 02, ...) 확인 → 다음 번호 폴더 생성
  3. `--type` 미지정 시 planner가 research.md 내용 기반으로 적합한 타입 판단
  4. research.md + `marketing/brand/tone.md` + `marketing/templates/*.md` (조합 가이드) + `marketing/templates/layouts/` 참조
  5. planner 에이전트 실행
  6. `{번호}/plan.md` 작성
  7. 완료 안내: "기획안 확인해주세요. 수정사항 있으면 말씀, 없으면 /content create"
- **에러 처리**:
  - research.md 없음: "먼저 /content research를 실행하세요" 안내 후 중단
  - 감지된 폴더 없음: "대상 콘텐츠 폴더가 없습니다. /content research를 먼저 실행하세요" 후 중단

### /content create

plan.md 기반으로 슬라이드 HTML을 생성한다.

- **에이전트**: maker
- **input**:
  - 자동 감지 또는 `--folder {폴더명}` 명시
- **output**:
  - `{콘텐츠폴더}/{번호}/slides/slide-{N}.html` (슬라이드별 HTML)
- **실행 절차**:
  1. 폴더 자동 감지: 콘텐츠 폴더 내 `{번호}/plan.md` 있고 `{번호}/slides/` 없는 최신 번호 폴더 감지 (아래 규칙 참조)
  2. plan.md + `marketing/brand/design-tokens.css` + `marketing/templates/layouts/` 참조
  3. maker 에이전트 실행
  4. `{번호}/slides/*.html` 생성
  5. 완료 안내: "HTML 생성 완료. 브라우저에서 확인 후 /content render 실행하세요"
- **에러 처리**:
  - plan.md 없음: "먼저 /content plan을 실행하세요" 안내 후 중단

### /content render

slides/*.html을 PNG로 변환한다. 스킬이 직접 Bash로 render.js를 호출하며 에이전트 위임 없음.

- **에이전트**: 없음 (스킬 직접 실행)
- **input**:
  - 자동 감지 또는 `--folder {폴더명}` 명시
- **output**:
  - `{콘텐츠폴더}/{번호}/output/slide-{N}.png` (PNG 변환 결과, 1080×1440px)
- **실행 절차**:
  1. 폴더 자동 감지: 콘텐츠 폴더 내 `{번호}/slides/` 있고 `{번호}/output/` 없는 최신 번호 폴더 감지 (아래 규칙 참조)
  2. Playwright 설치 확인 (`marketing/node_modules` 존재 여부)
  3. `slides/*.html` 목록 취득 (파일명 오름차순)
  4. 각 HTML에 대해 `node {PLUGIN_DIR}/scripts/render.js {html경로} {png경로} --width 1080 --height 1440` Bash 호출
  5. 완료 안내: "PNG 변환 완료. output/ 폴더에서 결과 확인하세요"
- **에러 처리**:
  - slides/ 없음: "먼저 /content create를 실행하세요" 안내 후 중단
  - Playwright 미설치: "marketing 프로젝트에서 npm install 실행 필요" 안내 후 중단
  - 웹폰트 로딩 실패: fallback 폰트(system sans-serif)로 렌더링 + 경고 출력
  - render.js 실행 실패 (개별 슬라이드): 실패 파일 로그 출력 + 나머지 계속 변환

### /content caption

plan.md 기반으로 인스타그램 캡션을 작성한다. render 완료 여부와 무관하게 plan.md만 있으면 실행 가능.

- **에이전트**: writer
- **input**:
  - 자동 감지 또는 `--folder {폴더명}` 명시
- **output**: `{콘텐츠폴더}/{번호}/caption.md`
- **실행 절차**:
  1. 폴더 자동 감지: 콘텐츠 폴더 내 `{번호}/plan.md` 있는 가장 큰 번호 폴더 감지 (아래 규칙 참조)
  2. plan.md + `marketing/brand/tone.md` 참조
  3. writer 에이전트 실행
  4. `{번호}/caption.md` 작성
  5. 완료 안내: "캡션 작성 완료. caption.md 확인 후 수정사항 있으면 말씀해주세요"
- **caption.md 구조**:
  - **훅 (첫 줄)**: 피드에서 "더보기"를 누르게 만드는 한 줄
  - **본문**: 카드뉴스 핵심 요약 (3~5문장, 줄바꿈 활용)
  - **CTA**: 행동 유도 ("저장해두세요", "댓글로 알려주세요" 등)
  - **해시태그**: 10~15개
- **톤/스타일**:
  - `brand/tone.md` 참조하여 브랜드 톤 유지
  - 인스타그램에 맞는 캐주얼하면서도 정보전달력 있는 톤
  - AI 트로프 회피 (tone.md 가이드 준수)
  - 전체 길이: 인스타그램 캡션 제한(2,200자) 내
- **에러 처리**:
  - plan.md 없음: "먼저 /content plan을 실행하세요" 안내 후 중단
  - brand/tone.md 없음: 경고 출력 후 기본 톤으로 진행

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

### /asset

에셋 라이브러리를 관리한다. inbox 파일을 분류·정리하거나 등록된 에셋 목록을 조회한다.

- **에이전트**: 없음 (스킬 직접 실행)
- **서브커맨드**: `organize`, `list`

#### /asset organize

- **input**: 없음
- **output**:
  - `marketing/assets/photos/{파일명}` — 사진 파일 이동
  - `marketing/assets/screenshots/{파일명}` — 스크린샷 파일 이동
  - `marketing/assets/articles/{파일명}` — 기사/스크랩 파일 이동
  - `marketing/assets/photos/index.md` — 사진 index 행 추가
  - `marketing/assets/screenshots/index.md` — 스크린샷 index 행 추가
  - `marketing/assets/articles/index.md` — 기사/스크랩 index 행 추가
- **실행 절차**:
  1. `assets/inbox/` 폴더 존재 확인 (없으면 중단)
  2. inbox 파일 목록 스캔. 비어있으면 "inbox에 파일이 없습니다" 안내 후 중단
  3. 각 파일을 Read 도구로 읽어서 AI 분석 — 사진 vs 스크린샷 vs 기사/스크랩 판별, 태그/분위기/추천 용도 생성
     - 사진이면 Unsplash URL이 파일명에 포함 시 WebFetch로 메타데이터 파싱 시도, 실패 시 오너에게 수동 입력 요청
     - 텍스트/마크다운 파일은 articles로 분류
  4. 분류에 따라 `assets/photos/`, `assets/screenshots/`, 또는 `assets/articles/`로 이동
  5. 해당 `index.md`에 행 추가 (없으면 헤더 행 포함 자동 생성)
  6. inbox에서 파일 제거 (이동 완료 확인 후)
  7. 결과 요약 출력 (처리 건수, 사진/스크린샷/기사 분류 결과, 스킵 건수)
- **에러 처리**:
  - `assets/inbox/` 폴더 없음: "assets/inbox/ 폴더를 먼저 생성하세요" 안내 후 중단
  - 지원 안 되는 파일 형식: 해당 파일 스킵 + 경고 출력 후 나머지 계속 처리
  - `index.md` 없음: 헤더 행 포함 자동 생성

#### /asset list

- **input**:
  - 선택: `--tags "태그"` (태그 필터, OR 조건)
- **output**: 콘솔 출력 (에셋 수 + 태그별 분포 + 목록 테이블)
- **실행 절차**:
  1. `marketing/assets/photos/index.md` + `marketing/assets/screenshots/index.md` + `marketing/assets/articles/index.md` 읽기
  2. `--tags` 필터 있으면 해당 태그 포함 행만 필터링 (대소문자 구분 없음)
  3. 에셋 수 + 태그별 분포 요약 + 목록 테이블 출력 (사진 / 스크린샷 / 기사 섹션 구분)
  4. 필터 결과 0건이면 "해당 태그의 에셋이 없습니다" 안내
- **에러 처리**:
  - index.md 모두 없음: "등록된 에셋이 없습니다. /asset organize를 먼저 실행하세요" 안내

---

## 승인 게이트

`/content plan` 완료 후 `/content create` 실행 전에 오너가 plan.md를 확인한다.

- **plan.md 직접 편집 후 `/content create`**: maker는 최종 plan.md 그대로 반영
- **피드백 텍스트 전달 후 `/content plan` 재실행**: planner가 피드백 반영하여 plan.md 재작성
- **그대로 승인 후 `/content create`**: 변경 없이 제작 진행
