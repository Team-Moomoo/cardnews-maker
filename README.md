# cardnews-maker

> **강의 데모용 플러그인.** "Claude Code 스킬 안에 brand reference와 산출물 template을 박아넣어 일관된 결과물을 뽑는 패턴"을 보여주기 위한 예시. 다른 브랜드에 그대로 쓰지 말고 reference·template을 갈아끼울 것.

카드뉴스 제작을 자동화하는 [Claude Code](https://claude.com/claude-code) 플러그인. 카드뉴스 한 편을 만들기 위해 거치는 5단계를 단일 `/content` 스킬과 4개 전담 에이전트로 실행한다.

| # | 스킬 | 산출물 | 에이전트 |
|---|------|--------|----------|
| ① | `/content research "주제"` | `research.md` | researcher |
| ② | `/content plan` | `plan.md` (오너 승인 게이트) | planner |
| ③ | `/content create` | `slides/*.html` | maker |
| ④ | `/content render` | `output/*.png` (1080×1440) | — (Playwright) |
| ⑤ | `/content caption` | `caption.md` | writer |

## 강의 메시지

스킬을 만들 때 두 가지 종류의 자료를 플러그인 내부에 박을 수 있다:

- **`reference/`** — 가이드/원칙 (브랜드 톤, 디자인 토큰, 조합 가이드 등). 에이전트가 의사결정할 때 참조.
- **`template/`** — 채워 쓰는 양식 (산출물 양식, 슬라이드 레이아웃 등). 에이전트가 형식을 그대로 따르도록.

사용자 워크스페이스에 잡일을 떠넘기지 말고, 일관된 결과물을 뽑는 데 필요한 자료는 플러그인 안에서 해결한다. 이 플러그인은 그 패턴을 가장 단순한 형태로 보여준다.

## Installation

### Marketplace

```
/plugin marketplace add Team-Moomoo/cardnews-maker
/plugin install cardnews-maker@cardnews-maker
```

### Manually

```bash
git clone https://github.com/Team-Moomoo/cardnews-maker.git \
  ~/.claude/plugins/cardnews-maker
```

## 사용법

### 산출물이 쌓이는 위치

플러그인은 CWD의 `content/` 하위에 결과물을 쌓는다. 사용자가 미리 준비할 폴더는 없다.

```
$CWD/
└── content/
    └── 2026-05-09-주제명/
        ├── research.md          # /content research
        └── 01/
            ├── plan.md          # /content plan
            ├── slides/*.html    # /content create
            ├── output/*.png     # /content render
            └── caption.md       # /content caption
```

같은 주제로 다른 시안을 만들면 `02/`, `03/` … 번호 폴더가 늘어난다.

### 5단계 흐름

```
① /content research "구독 경제 5가지 트렌드"   → research.md
② /content plan                              → 01/plan.md  (승인 게이트)
③ /content create                            → 01/slides/*.html
④ /content render                            → 01/output/*.png
⑤ /content caption                           → 01/caption.md
```

각 단계는 직전 단계의 산출물을 입력으로 받는다. `/content plan` 이후에는 오너가 plan.md를 확인·수정한 뒤에 `/content create`로 진행한다.

## 에이전트 (4종)

| 에이전트 | 모델 | 역할 |
|----------|------|------|
| researcher | sonnet | 주제 키워드 → 웹 리서치 → research.md (template 양식) |
| planner | opus | research.md → plan.md (tone + 조합 가이드 + plan template 기반) |
| maker | sonnet | plan.md → 슬라이드 HTML (디자인 토큰 인라인 + 레이아웃 템플릿) |
| writer | sonnet | plan.md → 인스타그램 캡션 (tone 기반) |

## 의존성

- **PNG 렌더링**: `/content render`는 Playwright 기반 `scripts/render.js`를 사용. 첫 사용 시 CWD에서 `npm install playwright && npx playwright install chromium` 필요.

## 한계

- 인스타그램 카드뉴스(1080×1440) 포맷 기준. 다른 비율은 `scripts/render.js` 인자 조정 필요.
- 강의 데모용 — `skills/content/reference/`의 톤/디자인 토큰/로고가 루바토 브랜드로 박혀있다. 다른 브랜드 적용 시 reference 갈아끼우기 필수.
- 산출물은 항상 CWD의 `content/` 하위에 저장.

## 구조

```
.claude-plugin/
├── marketplace.json
└── plugin.json
agents/
├── researcher.md
├── planner.md
├── maker.md
└── writer.md
skills/content/
├── SKILL.md          # 5단계 파이프라인 진입점 (스킬 SSOT)
├── reference/        # 가이드/원칙 (planner·writer·maker가 참조)
│   ├── tone.md             # 브랜드 톤·훅 프레임·AI 트로프 회피
│   ├── design-tokens.css   # 색상·폰트·캔버스 토큰
│   ├── logo.svg            # 클로저 슬라이드용 로고
│   └── comparison.md       # 슬라이드 조합 가이드
└── template/         # 채워 쓰는 양식
    ├── research.md         # researcher 산출 양식
    ├── plan.md             # planner 산출 양식
    └── layouts/            # 슬라이드 레이아웃 HTML (maker가 base로 사용)
        └── comparison.html
scripts/render.js     # HTML → PNG 변환
```

각 단계 동작은 `skills/content/SKILL.md`에, 에이전트별 역할/제약은 `agents/*.md`에 정의되어 있다.

## 라이선스

[MIT](./LICENSE)

## 크레딧

- 원작 컨셉 & 파이프라인 설계: [@lazyyoyo](https://github.com/lazyyoyo)
- Team Moomoo (lazyyoyo + jojo) 공동 운영
