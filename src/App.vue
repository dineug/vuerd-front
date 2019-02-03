<template lang="pug">
  #app
    router-view
</template>

<style lang="scss">
  /*reset css*/
  /*모든 태그요소들의 여백을 초기화*/
  * {
    margin: 0px;
    padding: 0px;
  }

  /*제목태그의 크기를 body에서 맞춘 크기와 동일하게 변경*/
  h1, h2, h3, h4, h5, h6 {
    font-size: 100%;
  }

  /*목록(리스트들의) 기호를 안보이게 처리*/
  ul, ol {
    list-style: none;
  }

  /*링크의 밑줄을 제거*/
  a {
    text-decoration: none;
  }

  /*인터넷 익스플로러에서 img태그에 링크걸었을때 나오는 테두리선 제거*/
  img {
    border: none;
  }

  /*테이블 태그 칸 사이 간격들을 없애주게 처리*/
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  /*body 태그안에서 쓰는 기본 글꼴을 초기화 - 본인이 사용하는 시스템 폰트중에서 아래 나와있는 폰트중 하나를 보여줌 윈도우는 돋움 맥은 헬베티카 애플고딕 그리고 앞에 폰트들이 없을 경우에는 sans-serif로 보여줌*/

  /*줄간격(행간은)글씨크기와 똑같은 비율로 맞춤 1배율 = 즉 12px*/
  body {
    font-family: 'Noto Sans', sans-serif;
    font-size: 12px;
    line-height: 1;
  }
</style>
