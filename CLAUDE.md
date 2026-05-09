# cardnews-maker

> **강의 데모용 플러그인.** 브랜드 톤·디자인 토큰·로고·조합 가이드·산출물 양식을 모두 `skills/content/reference/`와 `skills/content/template/`에 내장한다. "스킬 안에 reference/template을 박아 일관된 산출물을 뽑는 방법"을 보여주는 예시다. 강의 데모는 루바토 브랜드 기준.

카드뉴스 자동화 플러그인.

## 스킬

- `/content research "주제"` — 리서치 → research.md
- `/content plan` — 기획안 → plan.md (승인 게이트)
- `/content create` — HTML 제작 → slides/*.html
- `/content render` — PNG 변환 → output/*.png
- `/content caption` — 인스타그램 캡션 → caption.md

## 에이전트

| 에이전트 | 모델 | 역할 |
|---------|------|------|
| researcher | sonnet | 웹 리서치, 팩트 수집 |
| planner | opus | 슬라이드 기획, 카피 |
| maker | sonnet | HTML 제작 |
| writer | sonnet | 인스타그램 캡션 작성 |

## 규칙

- SSOT: `skills/content/SKILL.md` + `agents/*.md` (별도 spec 문서 없음)
- 산출물 경로: CWD의 `content/{날짜-슬러그}/{번호}/` 하위
- 브랜드 reference·산출물 template은 플러그인 내장 — `${CLAUDE_PLUGIN_ROOT}/skills/content/reference/`, `${CLAUDE_PLUGIN_ROOT}/skills/content/template/`
- 에이전트는 자기 산출물만 작성 (역할 경계 엄수)
- plan.md 승인 전 /content create 실행 금지
