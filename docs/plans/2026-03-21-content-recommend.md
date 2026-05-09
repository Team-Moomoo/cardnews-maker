# Content Recommend 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/content recommend` 서브커맨드와 recommender 에이전트를 추가하고, asset organize에 기사/스크랩 분류를 확장한다.

**Architecture:** content SKILL.md에 recommend 서브커맨드 추가, recommender 에이전트가 보유자료+트렌드+갭 분석 후 콘솔 출력. asset organize는 기존 사진/스크린샷 외에 기사/스크랩 분류 분기 추가.

**Tech Stack:** Claude Code 플러그인 (마크다운 기반 스킬/에이전트 정의)

**Spec:** `docs/specs/2026-03-21-content-recommend-design.md`

---

## 파일 구조

| 파일 | 작업 | 역할 |
|------|------|------|
| `agents/recommender.md` | 생성 | recommender 에이전트 정의 |
| `skills/content/SKILL.md` | 수정 | recommend 서브커맨드 추가 |
| `skills/asset/SKILL.md` | 수정 | organize에 기사 분류 추가, list에 articles 출력 추가 |
| `docs/specs/skills.md` | 수정 | 파이프라인 매핑 + /content recommend 정의 추가 |
| `docs/specs/agents.md` | 수정 | recommender 에이전트 정의 추가 |
| `CLAUDE.md` | 수정 | 에이전트 테이블에 recommender 추가 |
| `.claude-plugin/plugin.json` | 수정 | 버전 범프 |

---

### Task 1: recommender 에이전트 파일 생성

**Files:**
- Create: `plugins/team-marketing/agents/recommender.md`
- Reference: `plugins/team-marketing/agents/researcher.md` (기존 에이전트 패턴 참조)
- Reference: `plugins/team-marketing/docs/specs/2026-03-21-content-recommend-design.md` (스펙)

- [ ] **Step 1: 기존 에이전트 패턴 확인**

`agents/researcher.md`의 frontmatter + 섹션 구조를 참조하여 동일 패턴 사용.

- [ ] **Step 2: recommender.md 생성**

```markdown
---
name: recommender
description: "Use this agent when you need content topic recommendations based on owned materials, external trends, and content gap analysis. Examples: '/content recommend' to get 5 topic suggestions, '/content recommend 독서' to get focused recommendations."
model: sonnet
tools: ["Read", "Grep", "Glob", "WebSearch", "WebFetch"]
---

## 역할

보유자료 + 외부 트렌드 + 기존 콘텐츠 분석을 종합하여 콘텐츠 주제를 추천한다.
- 프로젝트 에셋(inbox/photos/screenshots/articles)과 기존 콘텐츠 폴더를 스캔
- 웹 검색으로 스코핑 범위 내 트렌드 수집
- 갭 분석: 기존 콘텐츠와 겹치지 않는 영역, 시리즈 확장 가능 주제 식별
- 보유자료와 트렌드 교차점에서 주제 후보 도출

## 입력

- 키워드 (선택) — 있으면 해당 키워드 중심 포커싱
- `{project}/brand/tone.md` — 키워드 없을 때 타겟 분야/페르소나 추출
- `{project}/assets/inbox/` — 미분류 자료
- `{project}/assets/photos/index.md` — 사진 에셋
- `{project}/assets/screenshots/index.md` — 스크린샷 에셋
- `{project}/assets/articles/index.md` — 기사/스크랩 에셋
- `{project}/content/` — 기존 콘텐츠 폴더 (폴더명에서 슬러그 추출)

## 출력

콘솔 출력만 (파일 저장 없음). 형식:

## 콘텐츠 추천

1. **{주제 제목}**
   추천 이유: {외부 트렌드/갭/보유자료 근거}
   보유자료: {관련 inbox 파일이나 에셋 있으면 언급, 없으면 생략}
   시리즈: {기존 콘텐츠와 시리즈 연결 가능하면 언급, 아니면 생략}

(5개)

## 실행절차

1. 키워드 유무 확인
2. 키워드 없으면 `{project}/brand/tone.md` 읽어서 타겟 분야/페르소나 추출 (tone.md 없으면 에러 → 스킬에서 처리)
3. 보유자료 스캔:
   - `{project}/assets/inbox/` 파일 목록 + 내용 요약
   - `{project}/assets/photos/index.md` 읽기 (없으면 스킵)
   - `{project}/assets/screenshots/index.md` 읽기 (없으면 스킵)
   - `{project}/assets/articles/index.md` 읽기 (없으면 스킵)
4. 기존 콘텐츠 스캔: `{project}/content/` 하위 폴더명에서 날짜+슬러그 추출 → 주제 목록
5. 웹 검색: 스코핑 범위 내 최근 트렌드/화제 수집 (3~5회 검색)
6. 갭 분석:
   - 기존 콘텐츠 주제와 겹치지 않는 트렌드 식별
   - 기존 주제 중 시리즈 확장 가능한 것 식별
   - 보유자료(inbox/에셋)와 트렌드 교차점 식별
7. 주제 후보 5개 선정 + 출력 형식에 맞춰 콘솔 출력

## 제약

- 리서치/기획/제작 금지 — 주제 추천만 수행
- 추천 이유에 근거 명시 (트렌드 출처 URL, 보유자료 파일명, 기존 콘텐츠 갭 등)
- 기존 콘텐츠와 중복되는 주제 추천 금지

## 품질기준

- 추천 5개, 각각 추천 이유 필수
- 스코핑 범위 내 주제만 (브랜드 톤/키워드에서 벗어나지 않음)
- 기존 콘텐츠와 명확히 차별화
- 트렌드 출처에 URL 또는 출처명 포함
```

- [ ] **Step 3: 커밋**

```bash
git add plugins/team-marketing/agents/recommender.md
git commit -m "feat(team-marketing): recommender 에이전트 추가"
```

---

### Task 2: content SKILL.md에 recommend 서브커맨드 추가

**Files:**
- Modify: `plugins/team-marketing/skills/content/SKILL.md`

- [ ] **Step 1: frontmatter 업데이트**

description과 argument-hint에 recommend 추가.

```yaml
---
name: content
description: "마케팅 콘텐츠 파이프라인. /content recommend, /content research, /content plan, /content create, /content render 서브커맨드로 추천→리서치→기획→HTML 제작→PNG 변환 단계를 순차 실행한다."
argument-hint: "<recommend|research|plan|create|render> [주제/키워드] [--project rubato|personal] [--type tip-list|comparison]"
---
```

- [ ] **Step 2: 서브커맨드 라우팅에 recommend 추가**

기존 라우팅 블록에 recommend 분기 추가:

```markdown
서브커맨드가 `recommend`이면 → **Recommend 섹션** 실행
서브커맨드가 `research`이면 → **Research 섹션** 실행
...
서브커맨드가 없거나 불명확하면 → 오너에게 `recommend`, `research`, `plan`, `create`, `render` 중 무엇인지 확인
```

- [ ] **Step 3: Recommend 섹션 추가**

Research 섹션 바로 위에 삽입:

```markdown
## Recommend — 추천

보유자료 + 외부 트렌드 + 기존 콘텐츠 갭 분석을 종합하여 주제 후보를 추천한다.

### 에이전트

- recommender

### Input / Output

- **input**: 키워드 (선택), `--project rubato|personal` (기본값: rubato)
- **output**: 콘솔 출력 (파일 저장 없음)

### 실행 절차

1. `--project` 파악 (기본값 rubato)
2. 키워드 유무 확인
3. 키워드 없으면 `{project}/brand/tone.md` 존재 확인 (없으면 에러 처리)
4. recommender 에이전트에 전달할 컨텍스트 구성:
   - 키워드 (있으면)
   - 프로젝트 경로: `~/hq/projects/marketing/{project}/`
5. recommender 에이전트 실행
6. 에이전트 출력을 그대로 오너에게 전달

### 에러 처리

- brand/tone.md 없음 + 키워드도 없음: "키워드를 지정하거나 brand/tone.md를 먼저 작성하세요" 안내 후 중단
```

- [ ] **Step 4: 커밋**

```bash
git add plugins/team-marketing/skills/content/SKILL.md
git commit -m "feat(team-marketing): /content recommend 서브커맨드 추가"
```

---

### Task 3: asset SKILL.md에 기사/스크랩 분류 확장

**Files:**
- Modify: `plugins/team-marketing/skills/asset/SKILL.md`

- [ ] **Step 1: Organize 섹션 — 분류 로직 확장**

기존 "사진 vs 스크린샷 판별" 부분을 3분기로 변경:

```markdown
4. 각 파일을 Read 도구로 읽어서 AI 분석:
   - **이미지 파일** (.jpg, .png, .webp 등):
     - 사진 vs 스크린샷 자동 판별 (기존 로직 동일)
     - 태그, 분위기, 추천 용도 생성
   - **텍스트/마크다운 파일** (.md, .txt, .url 등):
     - 기사/스크랩으로 분류
     - 제목, URL(있으면), 요약, 태그 추출
```

- [ ] **Step 2: Organize 섹션 — 이동 대상 추가**

기존 이동 절차에 articles 분기 추가:

```markdown
5. 분류에 따라 이동:
   - 사진 → `assets/photos/{파일명}` (Bash mv 사용)
   - 스크린샷 → `assets/screenshots/{파일명}` (Bash mv 사용)
   - 기사/스크랩 → `assets/articles/{파일명}` (Bash mv 사용)
```

- [ ] **Step 3: Organize 섹션 — articles index.md 업데이트 추가**

```markdown
6. 해당 `index.md` 행 추가:
   ...기존 photos/screenshots 내용...
   - `assets/articles/index.md` 없으면 자동 생성 (헤더 행 포함)
   - articles index.md에 행 추가: `| {파일명} | {제목} | {URL} | {요약} | {태그} | {수집일} |`
```

- [ ] **Step 4: Organize 섹션 — 결과 요약에 기사 카운트 추가**

```markdown
8. 결과 요약 출력:
   - 처리: N개
   - 사진: N개 → assets/photos/
   - 스크린샷: N개 → assets/screenshots/
   - 기사: N개 → assets/articles/
   - 스킵: N개
```

- [ ] **Step 5: List 섹션 — articles 조회 추가**

```markdown
1. `{project}/assets/photos/index.md` 읽기 (없으면 "사진 없음" 처리)
2. `{project}/assets/screenshots/index.md` 읽기 (없으면 "스크린샷 없음" 처리)
3. `{project}/assets/articles/index.md` 읽기 (없으면 "기사 없음" 처리)
```

출력에 기사 섹션 추가:

```markdown
**기사** (N개)
| 파일명 | 제목 | URL | 요약 | 태그 | 수집일 |
|--------|------|-----|------|------|--------|
...
```

- [ ] **Step 6: 커밋**

```bash
git add plugins/team-marketing/skills/asset/SKILL.md
git commit -m "feat(team-marketing): asset organize에 기사/스크랩 분류 추가"
```

---

### Task 4: 스펙 문서 업데이트 (skills.md + agents.md)

**Files:**
- Modify: `plugins/team-marketing/docs/specs/skills.md`
- Modify: `plugins/team-marketing/docs/specs/agents.md`

- [ ] **Step 1: skills.md — 파이프라인 매핑 업데이트**

```
⓪ 추천     /content recommend "키워드"  → 콘솔 출력
① 리서치   /content research "주제"     → research.md
② 기획     /content plan               → plan.md  (승인 게이트)
③ 제작     /content create             → slides/*.html
④ 변환     /content render             → output/*.png
```

- [ ] **Step 2: skills.md — /content recommend 스킬 정의 추가**

`### /content recommend` 섹션을 `### /content research` 앞에 추가. 스펙 문서의 실행 절차/에러 처리 내용 반영.

- [ ] **Step 3: skills.md — /asset organize에 기사 분류 반영**

기존 정의에 기사/스크랩 분류 분기와 `assets/articles/` 관련 내용 추가.

- [ ] **Step 4: skills.md — /asset list에 articles 반영**

출력에 기사 섹션 추가.

- [ ] **Step 5: agents.md — recommender 에이전트 추가**

기존 에이전트 목록 헤더를 `## 에이전트 목록 (4종)`으로 변경하고, planner 섹션 앞에 recommender 정의 추가:

```markdown
### recommender

보유자료 + 외부 트렌드 + 기존 콘텐츠 분석으로 주제 추천.

- **모델**: sonnet
- **도구**: Read, Grep, Glob, WebSearch, WebFetch
- **역할**:
  - 프로젝트 에셋(inbox/photos/screenshots/articles) + 기존 콘텐츠 스캔
  - 웹 검색으로 트렌드 수집
  - 갭 분석 + 보유자료 매칭
  - 주제 후보 5개 콘솔 출력
- **입력**: 키워드(선택) + `{project}/brand/tone.md` + 에셋 index 파일들 + `{project}/content/`
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
```

- [ ] **Step 6: agents.md — last-updated 날짜 업데이트**

`last-updated: 2026-03-21`

- [ ] **Step 7: 커밋**

```bash
git add plugins/team-marketing/docs/specs/skills.md plugins/team-marketing/docs/specs/agents.md
git commit -m "docs(team-marketing): skills.md/agents.md에 recommend + articles 반영"
```

---

### Task 5: CLAUDE.md + plugin.json 업데이트

**Files:**
- Modify: `plugins/team-marketing/CLAUDE.md`
- Modify: `plugins/team-marketing/.claude-plugin/plugin.json`

- [ ] **Step 1: CLAUDE.md — 스킬 목록에 recommend 추가**

```markdown
## 스킬

- `/content recommend "키워드"` — 주제 추천 → 콘솔 출력
- `/content research "주제"` — 리서치 → research.md
...
```

- [ ] **Step 2: CLAUDE.md — 에이전트 테이블에 recommender 추가**

```markdown
| 에이전트 | 모델 | 역할 |
|---------|------|------|
| recommender | sonnet | 보유자료+트렌드 기반 주제 추천 |
| researcher | sonnet | 웹 리서치, 팩트 수집 |
...
```

- [ ] **Step 3: plugin.json — 버전 범프**

`"version": "0.2.0"` → `"version": "0.3.0"`

- [ ] **Step 4: 커밋**

```bash
git add plugins/team-marketing/CLAUDE.md plugins/team-marketing/.claude-plugin/plugin.json
git commit -m "chore(team-marketing): v0.3.0 — recommend 스킬 + inbox 통합"
```

---

### Task 6: 스펙 문서 status 업데이트

**Files:**
- Modify: `plugins/team-marketing/docs/specs/2026-03-21-content-recommend-design.md`

- [ ] **Step 1: status를 done으로 변경**

`status: draft` → `status: done`

- [ ] **Step 2: 커밋**

```bash
git add plugins/team-marketing/docs/specs/2026-03-21-content-recommend-design.md
git commit -m "docs(team-marketing): content-recommend 설계 status done"
```
