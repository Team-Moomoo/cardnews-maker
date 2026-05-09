---
last-updated: 2026-03-21
status: done
---

# Content Recommend 설계

## 개요

`/content recommend` — 콘텐츠 파이프라인 최앞단에서 "뭘 만들지" 추천하는 스킬.
보유자료 + 외부 트렌드 + 기존 콘텐츠 갭 분석을 종합하여 주제 후보 5개를 제안한다.

```
[recommend] → research → plan → create → render
```

## 호출

```
/content recommend                        # marketing/brand/tone.md 기반 스코핑
/content recommend "독서"                  # 키워드 포커싱
```

## 에이전트

- **recommender** (신규)
- 모델: sonnet
- 도구: Read, Grep, Glob, WebSearch, WebFetch

## 입력

- 선택: 키워드 문자열 (인자)

## 산출물

- 콘솔 출력만 (파일 저장 없음)

## 실행 절차

1. **스코핑**: 키워드 있으면 키워드 중심, 없으면 `marketing/brand/tone.md`에서 타겟 분야/페르소나 추출
2. **보유자료 스캔**:
   - `marketing/assets/inbox/` — 미분류 자료
   - `marketing/assets/photos/index.md` — 사진 에셋
   - `marketing/assets/screenshots/index.md` — 스크린샷 에셋
   - `marketing/assets/articles/index.md` — 기사/스크랩 에셋
   - `marketing/content/` — 기존 콘텐츠 폴더 주제 목록 (폴더명에서 슬러그 추출)
3. **외부 트렌드 스캔**: 스코핑 범위 내 웹 검색으로 최근 트렌드/화제 수집
4. **갭 분석 + 매칭**:
   - 기존 콘텐츠와 겹치지 않는 영역 식별
   - 시리즈 확장 가능한 기존 주제 식별
   - 보유자료(inbox/에셋)와 트렌드 교차점 식별
5. **주제 후보 5개 콘솔 출력**

## 출력 형식

```
## 콘텐츠 추천

1. **{주제 제목}**
   추천 이유: {외부 트렌드/갭/보유자료 근거}
   보유자료: {관련 inbox 파일이나 에셋 있으면 언급, 없으면 생략}
   시리즈: {기존 콘텐츠와 시리즈 연결 가능하면 언급, 아니면 생략}

2. ...
(5개)
```

## 에러 처리

| 상황 | 대응 |
|------|------|
| brand/tone.md 없음 (키워드도 없음) | "키워드를 지정하거나 brand/tone.md를 먼저 작성하세요" 안내 후 중단 |
| 웹 검색 실패 | 보유자료 + 기존 콘텐츠 기반으로만 추천 (트렌드 섹션 생략) + 경고 출력 |
| 보유자료 없음 (inbox/에셋 비어있음) | 트렌드 + 갭 분석만으로 추천 (보유자료 연결점 생략) |
| 기존 콘텐츠 없음 | 갭 분석 스킵, 트렌드 + 보유자료 기반으로만 추천 |

## 연관 변경: inbox 통합

현재 에셋(사진/스크린샷)과 소스(기사/스크랩)가 분리되어 있다.
inbox를 통합하여 모든 자료를 하나의 입구로 받고 AI가 분류한다.

### 변경 범위

- **asset organize 스킬 확장**: 기존 사진/스크린샷 외에 기사/스크랩 카테고리 추가
  - `assets/articles/` — 기사, 블로그 포스트, 스크랩
  - `assets/articles/index.md` — 기사 index
- **articles/index.md 스키마**:
  ```
  | 파일명 | 제목 | URL | 요약 | 태그 | 수집일 |
  ```
- **분류 로직**: inbox 파일을 AI가 사진/스크린샷/기사로 자동 판별
  - 이미지 파일 → 기존 로직 (사진 vs 스크린샷)
  - 텍스트/마크다운/URL 파일 → 기사/스크랩
- **sources/ 폴더와의 관계**: 기존 `{콘텐츠폴더}/sources/`는 유지 (특정 리서치용 자료). inbox 통합은 프로젝트 레벨 자료 관리.

## recommender 에이전트 정의

```yaml
name: recommender
model: sonnet
tools: [Read, Grep, Glob, WebSearch, WebFetch]
```

### 역할

보유자료 + 외부 트렌드 + 기존 콘텐츠 분석을 종합하여 콘텐츠 주제를 추천한다.

### 제약

- 리서치/기획/제작 금지 — 주제 추천만 수행
- 추천 이유에 근거 명시 (트렌드 출처, 보유자료 파일명, 기존 콘텐츠 갭 등)
- 기존 콘텐츠와 중복되는 주제 추천 금지

### 품질 기준

- 추천 5개, 각각 추천 이유 필수
- 스코핑 범위 내 주제만 (브랜드 톤/키워드에서 벗어나지 않음)
- 기존 콘텐츠와 명확히 차별화

## 구현 시 업데이트 대상

| 파일 | 변경 내용 |
|------|----------|
| `skills/content/SKILL.md` | recommend 서브커맨드 섹션 추가 |
| `agents/recommender.md` | 신규 에이전트 파일 생성 |
| `docs/specs/skills.md` | 파이프라인 매핑에 recommend 단계 추가 + `/content recommend` 스킬 정의 추가 |
| `docs/specs/agents.md` | recommender 에이전트 정의 추가 |
| `skills/asset/SKILL.md` | organize에 기사/스크랩 분류 분기 추가, list에 articles 출력 추가 |
| `CLAUDE.md` | 에이전트 테이블에 recommender 추가 |
| `.claude-plugin/plugin.json` | 버전 범프 |
