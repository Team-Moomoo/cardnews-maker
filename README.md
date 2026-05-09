# team-marketing

마케팅 콘텐츠 제작을 자동화하는 [Claude Code](https://claude.com/claude-code) 플러그인.

카드뉴스/릴스 한 편을 만들기 위해 거치는 6단계 — 주제 추천, 리서치, 기획, HTML 슬라이드 제작, PNG 변환, 인스타그램 캡션 — 를 단일 `/content` 스킬과 5개 전담 에이전트로 실행한다.

- `/content recommend "키워드"` — 보유자료 + 트렌드 기반 주제 추천
- `/content research "주제"` — 리서치 → `research.md`
- `/content plan` — 슬라이드 기획안 → `plan.md` (오너 승인 게이트)
- `/content create` — HTML 슬라이드 → `slides/*.html`
- `/content render` — PNG 변환 → `output/*.png`
- `/content caption` — 인스타그램 캡션 → `caption.md`

## Installation

### Marketplace

```
/plugin marketplace add Team-Moomoo/team-marketing
/plugin install team-marketing@team-marketing
```

### Manually

```bash
git clone https://github.com/Team-Moomoo/team-marketing.git \
  ~/.claude/plugins/team-marketing
```

## 사용 시나리오

### 1) 워크스페이스 준비

플러그인은 현재 작업 디렉토리(CWD) 기준으로 `marketing/` 하위에 산출물을 쌓는다. 마케팅 프로젝트 루트에서 실행하는 걸 전제로 한다.

```
my-project/
├── marketing/
│   ├── brand/tone.md            # (선택) 브랜드 톤·보이스
│   ├── content/
│   │   └── 2026-05-09-주제명/
│   │       ├── sources/         # (선택) 오너가 미리 넣어둔 자료
│   │       ├── research.md      # /content research 산출
│   │       ├── plan.md          # /content plan 산출
│   │       ├── slides/*.html    # /content create 산출
│   │       ├── output/*.png     # /content render 산출
│   │       └── caption.md       # /content caption 산출
```

`marketing/brand/tone.md` 가 있으면 추천·기획·캡션 단계에서 일관된 톤을 유지한다. 없어도 동작은 한다.

### 2) 6단계 파이프라인

```
⓪ 추천   /content recommend "구독 경제"  → 콘솔 출력 (저장 안 함)
① 리서치  /content research "구독 경제 5가지 트렌드"
② 기획   /content plan                  → plan.md  (승인 후 다음 단계)
③ 제작   /content create
④ 변환   /content render                → 1080×1440 PNG
⑤ 캡션   /content caption
```

각 단계는 직전 단계 산출물을 입력으로 한다. `plan.md`는 **승인 게이트** — 오너가 OK 하기 전 `/content create`를 실행하면 안 된다.

### 3) 자료 수동 투입

리서치 전에 오너가 직접 모은 자료(PDF, 캡처, 텍스트 등)를 `sources/` 폴더에 넣어두면 researcher가 먼저 읽고 그 위에 웹 리서치를 보충한다. 사내 데이터·인터뷰·기존 자료를 1차로 활용하고 싶을 때 사용.

## 에이전트 (5종)

| 에이전트 | 모델 | 역할 |
|----------|------|------|
| recommender | sonnet | 보유자료 + 트렌드 + 갭 분석으로 주제 추천 |
| researcher | sonnet | 웹 리서치, 팩트/수치 수집 (출처 명시) |
| planner | opus | 슬라이드 단위 기획·카피 |
| maker | sonnet | HTML 슬라이드 제작 |
| writer | sonnet | 인스타그램 캡션 작성 |

## 의존성

- **PNG 렌더링**: `/content render`는 Playwright 기반 `scripts/render.js`를 사용. 첫 사용 시 `npx playwright install chromium`이 필요할 수 있다.

## 한계

- 산출물은 인스타그램 카드뉴스(1080×1440) 포맷 기준. 다른 비율은 `scripts/render.js` 인자 조정 필요.
- 디자인 시스템 토큰은 별도 제공하지 않음 — `marketing/brand/tone.md` + 기획안에서 톤·룩을 정의해야 한다.
- `marketing/` 디렉토리 컨벤션을 가정한다. 다른 구조에서 쓰려면 스킬 호출 시 경로를 명시해야 한다.

## 구조

```
.claude-plugin/
├── marketplace.json   # 마켓플레이스 메타
└── plugin.json        # 플러그인 메타
agents/
├── recommender.md
├── researcher.md
├── planner.md
├── maker.md
└── writer.md
skills/
├── content/SKILL.md   # 6단계 파이프라인 진입점
└── asset/SKILL.md
hooks/hooks.json
scripts/render.js      # HTML → PNG 변환
docs/specs/            # 스킬·에이전트 SSOT
```

자세한 동작은 [skills.md](./docs/specs/skills.md) / [agents.md](./docs/specs/agents.md).

## 라이선스

[MIT](./LICENSE)

## 크레딧

- 원작 컨셉 & 파이프라인 설계: [@lazyyoyo](https://github.com/lazyyoyo)
- Team Moomoo (lazyyoyo + jojo) 공동 운영
