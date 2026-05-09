---
last-updated: 2026-03-29
---

# Agents

team-marketing 플러그인의 에이전트 정의. 스킬이 호출하는 실행 단위.

## 에이전트 목록 (5종)

### researcher

웹 검색 및 팩트/수치 수집.

- **모델**: sonnet
- **도구**: Read, Grep, Glob, WebSearch, WebFetch, Bash
- **역할**:
  - sources/ 폴더 확인 후 있으면 먼저 읽기
  - sources 기반 보충 리서치 (웹 검색)
  - sources 없으면 주제만으로 풀 리서치
  - 수집한 내용을 research.md에 통합 (출처 명시)
- **입력**: 주제 문자열 + `{콘텐츠폴더}/sources/` (선택)
- **출력**: `{콘텐츠폴더}/research.md`
- **실행 절차**:
  1. `{콘텐츠폴더}/sources/` 폴더 존재 여부 확인
  2. sources/ 있으면 폴더 내 파일 전체 읽기
  3. sources 내용 기반으로 보충 웹 검색 (수치, 출처, 최신 데이터 보강)
  4. sources/ 없으면 주제만으로 풀 리서치 (웹 검색 전담)
  5. Codex CLI 호출: `codex -q "{주제} 핵심 팩트/통계/인사이트 정리"` — 결과 수집 (CLI 미설치 시 스킵)
  6. 웹 검색 + Codex 결과를 `research.md`에 통합 저장 (출처 URL 및 날짜 명시, Codex 결과는 출처 "Codex CLI" 표기)
- **품질 기준**:
  - 모든 주장/수치에 출처(URL 또는 출처명) 명시
  - 수치는 발행 연도 포함 (ex. "2024년 기준")
  - 기획/카피 내용 포함 금지
  - sources 파일과 웹 검색 결과가 상충 시 양쪽 모두 기록 후 판단 유보
- **제약**:
  - 기획/카피 작성 금지
  - 주장에 반드시 출처 명시
  - Codex CLI: `codex -q` 형식 사용, 미설치 시 스킵 (웹 검색만으로 진행)

### recommender

보유자료 + 외부 트렌드 + 기존 콘텐츠 분석으로 주제 추천.

- **모델**: sonnet
- **도구**: Read, Grep, Glob, WebSearch, WebFetch
- **역할**:
  - 프로젝트 에셋(inbox/photos/screenshots/articles) + 기존 콘텐츠 스캔
  - 웹 검색으로 트렌드 수집
  - 갭 분석 + 보유자료 매칭
  - 주제 후보 5개 콘솔 출력
- **입력**: 키워드(선택) + `marketing/brand/tone.md` + 에셋 index 파일들 + `marketing/content/`
- **출력**: 콘솔 출력 (파일 저장 없음)
- **실행 절차**:
  1. 키워드 유무에 따라 스코핑 (키워드 or tone.md)
  2. 보유자료 스캔 (inbox + 에셋 index 파일 + content 폴더)
  3. 웹 검색으로 트렌드 수집 (3~5회)
  4. 갭 분석 + 보유자료 매칭
  5. 주제 후보 5개 선정 + 출력
- **제약**:
  - 리서치/기획/제작 금지
  - 추천 이유에 근거 명시
  - 기존 콘텐츠 중복 금지
- **품질 기준**:
  - 5개 추천, 각각 추천 이유 필수
  - 브랜드 톤/키워드 범위 내
  - 트렌드 출처 URL 또는 출처명 포함

### planner

슬라이드 구조, 카피, 비주얼 방향 기획.

- **모델**: opus
- **도구**: Read, Write, Edit, Grep, Glob
- **역할**:
  - research.md + brand/tone.md + templates/ 기반으로 콘텐츠 기획
  - 콘텐츠 타입 결정 (tip-list / comparison)
  - 슬라이드별 구조 (제목, 본문, 강조 텍스트, 레이아웃 지시) 작성
  - "문제로 시작, 제품은 해결 수단" 프레임 적용 (brand/tone.md 참조)
  - 훅 → 본문 → CTA 흐름 설계
- **입력**: `{콘텐츠폴더}/research.md` + `marketing/brand/tone.md` + `marketing/templates/*.md` (조합 가이드) + `marketing/templates/layouts/` + `marketing/assets/photos/index.md` (선택) + `marketing/assets/screenshots/index.md` (선택)
- **출력**: `{콘텐츠폴더}/{번호}/plan.md`
- **plan.md 포함 내용**:
  - 콘텐츠 타입 (tip-list / comparison)
  - 슬라이드 수
  - 슬라이드별: 슬라이드 번호, 제목, 본문, 강조 텍스트, 레이아웃 지시, **레이아웃** (hook / tip-card / comparison / chart / insight / quote / bento / photo-hero 중 하나)
  - 훅 → 본문 → CTA 흐름 명시
  - 차트 지시 (해당 시): 차트 타입(bar/doughnut/line), 데이터 라벨+값, 색상 힌트
- **실행 절차**:
  1. research.md 읽기 (주제, 핵심 팩트/수치 파악)
  2. `brand/tone.md` 읽기 (훅 프레임, 톤앤매너 확인)
  3. `templates/*.md` 조합 가이드 + `templates/layouts/` 확인 후 콘텐츠 타입 결정 (tip-list / comparison)
  4. 훅 → 본문 → CTA 흐름 설계
  5. 슬라이드별 구조 작성 (슬라이드 번호, 제목, 본문, 강조 텍스트, 레이아웃 지시) + **슬라이드별 레이아웃 지정 필수** (hook / tip-card / comparison / chart / insight / quote / bento / photo-hero 중 하나)
     - research.md에 통계/수치가 있으면 차트 슬라이드 검토: 차트 타입, 데이터, 라벨을 plan.md에 명시, chart 레이아웃 적극 검토
  6. 에셋 참조: `assets/photos/index.md`, `assets/screenshots/index.md` 파일이 존재하면 읽기
     - 슬라이드 주제와 태그/분위기가 맞는 사진이 있으면 plan.md에 이미지 힌트 필드 추가 (`이미지: photos/book-stack.jpg`)
     - 스크린샷이 필요한 슬라이드는 스크린샷 index에서 적합한 파일 선택 (`이미지: screenshots/home-screen.png`)
     - 에셋이 없거나 적합한 이미지가 없는 슬라이드는 이미지 힌트 생략 (에셋은 필수 아님 — CSS 장식으로 대체 가능)
  7. `plan.md` 저장
- **제약**:
  - HTML 직접 제작 금지
  - research.md가 없으면 실행 중단 (에러 처리 섹션 참조)
  - AI 트로프 회피 — brand/tone.md의 AI 트로프 회피 가이드를 준수. 단어/구조/톤/포맷 4축에서 AI스러운 패턴 금지
- **품질 기준**:
  - 모든 슬라이드에 레이아웃 지시 포함
  - **모든 슬라이드에 레이아웃 필드 포함** (hook / tip-card / comparison / chart / insight / quote / bento / photo-hero 중 하나)
  - **연속 3장 이상 같은 레이아웃 지양**
  - CTA는 Rubato 기능과 연결
  - 텍스트는 짧게 (슬라이드당 본문 3줄 이하 권장)
  - 카피가 AI 트로프 회피 가이드(tone.md)를 위반하지 않는지 자체 검증

### maker

HTML 제작.

- **모델**: sonnet
- **도구**: Read, Write, Edit, Grep, Glob
- **역할**:
  - plan.md에서 슬라이드별 구조 읽기
  - templates/에서 해당 타입 템플릿 로드
  - design-tokens.css 참조하여 슬라이드 HTML 생성
  - 차트 슬라이드: Chart.js CDN으로 바/도넛/라인 차트 구현
  - QA 자체 수행 후 산출물 확인
- **입력**: `{콘텐츠폴더}/{번호}/plan.md` + `marketing/brand/design-tokens.css` + `marketing/templates/layouts/{레이아웃}.html`
- **출력**:
  - `{콘텐츠폴더}/{번호}/slides/slide-01.html` … (슬라이드별)
- **실행 절차**:
  1. plan.md 읽기 (콘텐츠 타입 + 슬라이드별 구조 파악)
  2. plan.md의 슬라이드별 레이아웃 필드 읽기 → `marketing/templates/layouts/{레이아웃}.html` 로드
  3. `marketing/brand/design-tokens.css`를 `<link>`로 참조하는 HTML 생성
  4. 에셋 처리: plan.md 슬라이드에 이미지 힌트 필드(`이미지:`)가 있으면 해당 이미지 삽입
     - 사진(`photos/`)을 배경으로 쓸 경우: CSS `background-image` + 그라데이션 오버레이 자동 적용 (`linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))`)
     - 스크린샷 등 인라인 이미지는 `<img>` 태그로 삽입
     - `marketing/brand/logo.svg` 파일이 존재하면 슬라이드에 로고 삽입 (파일 없으면 생략)
  5. 차트 슬라이드: Chart.js CDN + chartjs-plugin-datalabels CDN 포함. datalabels 플러그인으로 바/도넛/라인 위에 값 직접 표시 (tooltip 비활성화 — PNG 렌더링 시 불필요). 브랜드 컬러 적용
  6. `slides/` 폴더 생성 후 `slide-{N:02d}.html` 저장
  7. QA 자체 수행 (아래 품질 기준)
- **제약**:
  - plan.md의 카피(텍스트) 수정 금지 — 그대로 반영
  - plan.md가 없으면 실행 중단 (에러 처리 섹션 참조)
  - PNG 변환 금지 — render는 `/content render` 스킬이 직접 수행
- **품질 기준**:
  - 캔버스 크기: 1080×1440px 확인
  - 폰트 최소 크기: 28px 이상
  - design-tokens.css의 CSS 변수만 사용 (하드코딩 색상 금지)
  - 모든 슬라이드 HTML 생성 완료 확인
  - 차트 슬라이드: Chart.js CDN 로드 확인, 데이터가 plan.md와 일치, 브랜드 컬러 사용
  - **plan.md의 레이아웃 필드와 실제 HTML 구조 일치 확인**
  - no-go 존 검증: 모든 텍스트/그래픽이 no-go 존(상단 120px, 하단 180px, 좌우 50px) 밖에 배치되었는지 확인

### writer

인스타그램 캡션 작성.

- **모델**: sonnet
- **도구**: Read, Grep, Glob
- **역할**:
  - plan.md에서 카드뉴스 핵심 메시지/구조 파악
  - brand/tone.md 기반으로 브랜드 톤 유지
  - 인스타그램 캡션 작성 (훅 + 본문 + CTA + 해시태그)
- **입력**: `{콘텐츠폴더}/{번호}/plan.md` + `marketing/brand/tone.md`
- **출력**: `{콘텐츠폴더}/{번호}/caption.md`
- **실행 절차**:
  1. `{콘텐츠폴더}/{번호}/plan.md` 읽기 (슬라이드별 제목, 본문, 핵심 메시지 파악)
  2. `marketing/brand/tone.md` 읽기 (브랜드 톤, AI 트로프 회피 가이드 확인)
  3. 훅 작성: 피드 스크롤 중 "더보기"를 누르게 만드는 한 줄. plan.md의 핵심 가치 제안 기반
  4. 본문 작성: 카드뉴스 핵심을 3~5문장으로 요약/재구성. 줄바꿈으로 가독성 확보
  5. CTA 작성: 행동 유도 문구 ("저장해두세요", "댓글로 알려주세요" 등)
  6. 해시태그 선정: 10~15개, 주제 관련 + 브랜드 관련 혼합
  7. `caption.md` 저장
- **제약**:
  - HTML 제작 금지
  - plan.md 카피 원문 그대로 사용 금지 (요약/재구성해야 함)
  - AI 트로프 회피 — brand/tone.md 가이드 준수
- **품질 기준**:
  - 전체 길이 2,200자 이내 (인스타그램 캡션 제한)
  - 훅이 호기심/공감을 유발하는지 확인
  - 본문이 카드뉴스 핵심을 정확히 전달하는지 확인
  - CTA가 구체적 행동을 유도하는지 확인
  - 해시태그 10~15개 범위 확인
  - tone.md AI 트로프 회피 가이드 위반 여부 자체 검증
