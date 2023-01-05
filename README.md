##  정치발자국 백엔드 refactoring 프로젝트

oxo politics 인턴십 프로젝트로 진행했던 [정치인의 인생그래프, 정치 발자국](http://politician-footprints.site)의 백엔드 부분을 RDB로 변경하고 리팩토링한 프로젝트입니다. 

<details> <summary> Getting Started  </summary>

<!-- <p align="left"> -->
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="20" alt="Nest Logo" /></a>


<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>



## Installation

```bash
$ npm install
```
## Create Config file
루트 폴더에 .env.dev 파일을 만들고 다음의 내용이 들어가도록 합니다.
```
DB_TYPE
DB_HOST 
DB_PORT 
DB_USERNAME 
DB_PASSWORD 
DB_NAME 
PORT 
KAKAO_ID  
KAKAO_CB_URL 
JWT_SECRET_KEY 
AES_KEY 
CLIENT_HOST
```

## Running the app

```bash
$ npm run start:dev

```


</details>

<br>

### 기존 프로젝트 DB 스펙

 *  mongoDB + mongoose 

### refactoring 프로젝트 DB 스펙

  * mariaDB + typeorm 

### refactoring 목적

  * RDB 및 typeorm 사용 훈련

  * auth, user, issue, politician 등 한 프로젝트의 백엔드 전체 직접 작성해보기


### refactoring 주안점

1. entity 작성과 entity간 관계 설정

    mongoose로 schema와 model을 만들어 모델링을 했다면 RDB를 사용하면서는 entity와 repository를 이용했다. 따라서 

    @Prop으로 관리하던 칼럼들이 @Column 데코레이터를 가지게 되고 1:1, 1:N, M:N 같은 테이블 간 관계 설정을 해주게 된다. 

2. 두 가지 투표 방식 구분 매서드명 수정

    유저는 

    1) 새로운 정치 이슈를 등록하거나

    2) 기존 이슈에 대해 정치인 그래프로의 반영 여부에 대한 찬반 투표를 한다.

    3) 찬반 투표가 일정 조건을 충족하면 그래프에 등록되고 OXㅅ 투표를 하게된다.

    

    기존 코드에서 이슈 등록 부분은 issue, regi(ster)란 단어를 활용하고
    OXㅅ 투표에는 Poll을 활용했다. 그리고 찬반, OXㅅ는 구분없이 모두 pro,con이란 단어를 사용했다.

    리팩토링에서는 이슈의 등록, 찬반 투표, OXㅅ 투표를 구분해 각각 add, vote, poll이란 용어를 사용하고 찬반투표는 agree, against를, OXㅅ 투표는 pro, con, neu를 사용했다. 


    기존 코드에서 이슈 투표 기능 구현 후 유저의 중복 방지 로직을 추가하면서 mongoDB의 sub document를 활용해 기존 이슈 스키마의 변경 없이 추가 기능을 구현할 수 있었지만 유저의 중복 투표 여부는 별도의 이슈 라우트로 들어와 유저 서비스를 조회하도록 되어 있었다. 
    
    리팩토링에선 테이블 설계시 각 이슈에 대한 투표 테이블에 유저 id를 외래키로 넣어 이슈 조회시 유저의 투표 여부를 조회하고 이슈 서비스의 투표 로직에서 중복 투표 방지 로직을 추가했다.

|  | 기존 코드 매서드명 | 리팩토링 코드 매서드명 |
| --- | --- | --- |
| 이슈 등록 | addIssue | addIssue |
| 정치인 메인 페이지용 이슈 조회 | getIssues <br> getIssuesRegistered <br> getAllActiveIssuesCount <br> getIssueNotRegisteredRanked <br> getIssueNotRegistered <br> getAllInactiveIssuesCount | getIssues<br>getIssuesForVote <br> getVoteActiveIssuesByPolitician <br> getTop3Issues <br> getTop3IssuesByPolitician |
|전체 정치인들에 대한 이슈 조회|getAllPoliticians|getAllPollIssuesPerPolitician|
| 이슈의 그래프 등록에 대한 찬반투표 | setUserIssueRegi <br> setIssueRegi | createVote <br> castVote |
| 유저의 중복 투표 방지 | setIssueRegi <br> getUserPollResult  | 이슈 서비스의 castVote 내부로직으로 편입 |
| 찬반투표 프로퍼티 | {pro, con} | {agree, against} |
| 그래프모달창의 이슈 및 투표결과 조회 | getIssuePoll <br>getUserPollResult | getIssuesForGraph getPollActiveIssuesByPolitician |
| 이슈에 대한 여론 투표(OXㅅ) | setIssuePoll <br> getUserPollResult <br>setUserPoll <br> setIssuePoll <br> updateUserPoll | createPoll <br> castPoll |
| OXㅅ 투표 프로퍼티 | {pro, con, neu} | {pro, con, neu} |

     
3. Restful API 원칙에 좀 더 충실하도록 자원의 구분

위 2번의 매서드명 수정도 행위에 대한 명확한 의도 전달을 위한 작업이었다. 이번엔 자원의 구분을 좀 더 세분화하기로 했다. 기존 코드가 `도메인 주소/issue` 주소 이후의 쿼리문에 따라 그래프에 등록된 이슈를 보여주거나 미등록된 top3를 보여주거나 미등록된 나머지 이슈를 보여주었다. 이 세가지 구분되는 행위가 모두 issue란 한 가지 자원을 바라보고 있었다. mongoDB에선 issue 스키마 하나에 sub document로 투표 정보에 대한 자원이 저장되어 있어 자원의 구분이 용이하지 않았다. RDB로 리팩토링하면서 issue, vote, poll 을 별도의 entity로 관리하게 되었으므로 위 매서드와 통일성을 가지도록 라우터를 분리했다. 

### API 목록

|ROUTE|METHOD|description|
|---|---|---|
|/auth/kakao|GET|카카오 로그인|
|/auth/kakao/callback|GET|카카오 콜백|
|---|---|---|
|/users|GET|모든 유저 조회|
|/users/:id|GET|id값으로 데이터 조회|
|/users/:email|GET|email로 데이터 조회|
|/users|POST|user데이터 생성|
|/users/:id|PATCH|user 데이터 수정|
|/users/:id|DELETE|user 데이터 삭제|
|---|---|---|
| /politicians | POST | 정치인 등록 |
| /politicians | GET | 정치인 전체 페이지 그래프용 이슈 조회 |
|---|---|---|
| /issues | POST | 이슈 등록 |
| /issues/:id/vote | POST | 그래프 등록에 대한 찬반 투표 |
| /issues/:id/poll | POST | OXㅅ 투표 |
| /issues | GET | oxㅅ 투표 가능한 전체 이슈 조회 |
| /issues/vote | GET | top3제외 찬반 투표 가능 이슈 조회 |
| /issues/vote/top3 | GET | top3 그래프 등록 임박 이슈 조회 |
| /issues/poll | GET | 정치인별 OXㅅ 투표 가능 이슈 조회 |
| /issues/:id | DELETE | 이슈 삭제 |


### 실행 결과 
[postman 문서](https://documenter.getpostman.com/view/20914545/2s8Z73xAcF) 참조


### 트러블 슈팅
1. skip, take not working

    페이지네이션을 위해선 필수인 문법인데 typeorm 공식 문서에는 limit, offset 대신 skip, take를 권장하고 있다. 그러나 실제 query builder에서 작성시 skip, take가 적용되지 않아 다른 곳에서 원인을 찾느라 시간 낭비가 있었다. 구글링 해보니 [typeorm의 skip, take에 이슈](https://github.com/typeorm/typeorm/issues/4742)가 있었다. limit, offset은 join문이 실행 후의 행에 대해 적용된다고 한다. 필자의 경우엔 join이나 where 조건을 처리한후 데이터에 대한 것이었으므로 limit, offset 사용이 옳았다. 복잡한 쿼리에는 기대처럼 적용되지 않을 것이니 skip, take 사용을 권장하는 [공식 문서](https://orkhan.gitbook.io/typeorm/docs/select-query-builder#adding-limit-expression)의 문구는 이유에 대한 한 줄의 설명이 더 필요해 보인다.

2. 최초 로그인 사용자를 위한 once token

    카카오 소셜로그인으로만 회원가입과 로그인이 동시 진행되도록 설계했었다. 최초 카카오 로그인을 하면 유저 정보가 없기 때문에 로그아웃 버튼으로 전환되지 않았다. 따라서 1회용 접근 토큰이 필요했는데 브라우저 쿠키에 once token이 저장된 이후에도 로그아웃 버튼으로 변경되지 않았다. 

    원인은 프론트에서 쿠키의 access_token, refresh_token으로 로그인 여부를 판단하는데 once_token만 있을때를 인식하지 못하는 것이었다.

    기존 로직을 
    ```
    if (req.user.type === 'once_token') {
        res.cookie('once_token', req.user.once_token);
      }
    res.cookie('access_token', req.user.access_token);
    res.cookie('refresh_token', req.user.refresh_token);
    ```
    과 같이 if ~ else문을 사용하지 않고 else문을 풀어주니 access_token, refresh_token 에는 각각 undefined가 들어가 프론트에서 로그인으로 인식하고 로그아웃 버튼으로 전환되었다. 

    그렇다면 위 코드에서 if문 로직만 없는 once token 미사용시엔 왜 access_token, refresh_token이 아예 발행되지 않았을까?

    const는 블록스코프를 가지기 때문이다. 
    once token 사용전 기존 로직은 다음과 같다.
    ```
    const user = await this.authService.validateUser(kakaoEmail);

      if (!user) {
        await this.authService.addUser(userProfile);
        const user = await this.authService.validateUser(kakaoEmail);
      }

      const accessToken = await this.authService.createLoginToken(user);
    ```
    user가 없으면 유저를 추가하고 if문 안에서 다시 const user를 생성하더라도 if문 블록 밖의 accessToken에서는 이 user를 읽지 못한다. if 문 바깥의 첫 줄의 const user를 바라보게 되므로 에러가 났던 것이다. 

    JS의 호이스팅과 스코프에 대한 좋은 공부가 되었다.
  
  3. 전체 정치인별 그래프를 위한 이슈 조회 데이터 전처리

      전체 정치인을 조회하고 그 정치인의 그래프에 등록된 이슈들을 프론트로 보내줄때 DB에서 조회한 데이터를 정치인을 구분할 수 있는 프로퍼티의 값으로 배열에 담아 보내고 싶었다. 데이터 전처리를 하지 않고 쿼리문으로 조회한 DB 정보는 다음과 같았다.


          ```
          [
            {
                  "politician_id": 8,
                  "issue_id": 23,
                  "date": "2022-12-27T14:02:53.603Z",
                  "score": "-2"
            },
            {
                "politician_id": 8,
                "issue_id": 22,
                "date": "2022-12-25T01:16:22.753Z",
                "score": "-2"
            },
            {
                "politician_id": 7,
                "issue_id": 21,
                "date": "2022-12-24T01:48:17.627Z",
                "score": "2"
            },
            {
                "politician_id": 7,
                "issue_id": 27,
                "date": "2023-01-02T05:14:57.938Z",
                "score": null
            }
          ]
          ```
        위와 같이 결과가 나온다면 프론트에서 정치인별로 매번 다시 순회하며 데이터를 정렬해야하는데 아래와 같이 정치인별로 프로퍼티로 만들어 보내면 객체 프로퍼티만 바로 조회할 수 있으므로 성능상 더 효율적일 것이다. 

        ```
        {
          "politician_id_8": [
              {
                  "politician_id": 8,
                  "issue_id": 23,
                  "date": "2022-12-27T14:02:53.603Z",
                  "score": "-2"
              },
              {
                  "politician_id": 8,
                  "issue_id": 22,
                  "date": "2022-12-25T01:16:22.753Z",
                  "score": "-2"
              }
          ],
          "politician_id_7": [
              {
                  "politician_id": 7,
                  "issue_id": 21,
                  "date": "2022-12-24T01:48:17.627Z",
                  "score": "2"
              },
              {
                  "politician_id": 7,
                  "issue_id": 27,
                  "date": "2023-01-02T05:14:57.938Z",
                  "score": null
              }
          ]
      }
      ```
      DB 쿼리문으로 위와 같은 결과를 보내고 싶었지만 방법을 찾지 못했다. getIssuesByPolitician이란 매서드를 만들어 정치인 id를 인수로 전달하면 해당 정치인의 이슈가 조회되도록 하고 모든 정치인의 이슈 조회 매서드에서 정치인 id가 담긴 배열에 map이나 forEach로 이 매서드를 적용하면 결과가 나올 것으로 생각했는데 비동기 처리를 해도 빈 배열만 나오고 원하는 결과가 나오지 않았다. 

      ```
      const politicians = await this.getAllPoliticians();

      const politicianIDs = Array.from(politicians).map((e) => e.id);  // 정치인들 id만 담긴 배열 생성

      //시도1
      const result = [];
      politicianIDs.forEach(async (e) =>
        result.push(await this.getIssuesByPolitician(e)),
      );  // 빈 배열 [] 반환

      //시도2
      const result = politicianIDs.map(async (e) =>  
      result.push(await this.getIssuesByPolitician(e)); 
      // 배열안에 빈 객체 나옴  

      const result = await this.getIssuesByPolitician(8);  
      //개별 정치인 이슈 정상 출력
      ```

      따로 전처리를 위한 객체의 동적 프로퍼티 생성 함수를 만들어 두고 모든 정치인의 이슈 조회 매서드에서 이 함수를 이용해 DB 조회 데이터를 재처리해 프론트로 보내주는 것으로 해결했다. 

      ```
      groupByPolitician(arr, prop) {
          return arr.reduce(function (acc, obj) {
            if (!acc[`${prop}_${obj[prop]}`]) {
              acc[`${prop}_${obj[prop]}`] = [];
            }
            acc[`${prop}_${obj[prop]}`].push(obj);
            return acc;
          }, {});
        }
      ```


     
### 리팩토링 후 느낀점
1. mongoDB가 document 확장의 유연함에 있어 확실히 강점이 있고 기존 프로젝트 진행시 추가 되는 기능 구현에서 이 점을 십분 활용했으나 RDB는 역시 강력했다. 쿼리문으로 원하는 결과를 조회하거나 join문 사용이 훨씬 깔끔했다. 

2. REST API에 대해 다시 깊게 생각할 수 있는 계기가 되었다. 자원과 행위의 분리, 경로명, 매서드명 등을 수없이 다시 생각하고 고쳤다. 아직도 RESTful을 완전히 이해하거나 리팩토링한 결과가 진짜 RESTful한가에 대해서는 회의적이다. 그러나 리팩토링 진행하면서 좀 더 이해가 깊어지고 경험이 쌓인다는 것에 만족한다.


3. 로컬 개발서버지만 백엔드 작업을 100% 혼자 다 해보는 경험이 굉장한 공부가 되었다. 기존 프로젝트에서는 auth, user부분 api를 맡고 CI/CD를 비롯한 배포 작업을 담당했었다. issue 부분은 유저의 중복 투표 방지 로직 정도만 참여했었는데 이번 리팩토링으로 직접 매서드를 하나씩 짜면서 에러를 풀다보니 눈으로만 코드를 볼 때와 확연히 달랐고 이제야 제대로 프로젝트를 끝낸 느낌이 든다.


### 아쉬운 점

프로젝트의 버전2가 나올지 모르겠다. 기획부터 흥미로운 아이디어였고 지금 정치 뉴스를 보면 서비스 해볼까는 욕심도 생긴다. 실제로 같이 작업했던 팀에서 서비스 얘기가 나오기도 했지만 리팩토링하면서 부족함을 다시 느꼈다. 당장의 서버(ec2 한대에서 프론트, 백 모두 배포되고 있다) 문제를 해결한다하더라도 유저의 부족 등록이나 정치인 추가에 대한 부분이 없는 것, 유사 이슈에 대한 처리 문제를 먼저 해결하지 않고는 어렵지 않겠나는 생각이 든다.