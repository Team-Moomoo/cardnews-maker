# team-marketing

마케팅 콘텐츠 자동화 플러그인.

## 스킬

- `/content recommend "키워드"` — 주제 추천 → 콘솔 출력
- `/content research "주제"` — 리서치 → research.md
- `/content plan` — 기획안 → plan.md (승인 게이트)
- `/content create` — HTML 제작 → slides/*.html
- `/content render` — PNG 변환 → output/*.png
- `/content caption` — 인스타그램 캡션 → caption.md

## 에이전트

| 에이전트 | 모델 | 역할 |
|---------|------|------|
| recommender | sonnet | 보유자료+트렌드 기반 주제 추천 |
| researcher | sonnet | 웹 리서치, 팩트 수집 |
| planner | opus | 슬라이드 기획, 카피 |
| maker | sonnet | HTML 제작 |
| writer | sonnet | 인스타그램 캡션 작성 |

## 규칙

- 구현 기준: docs/specs/ (SSOT)
- 프로젝트 workspace: CWD 기준 `marketing/` 하위
- 에이전트는 자기 산출물만 작성 (역할 경계 엄수)
- plan.md 승인 전 /content create 실행 금지
