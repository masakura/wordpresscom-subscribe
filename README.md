g# WordPress.com Subscriber
WordPress.com の記事の最新 20 件を購読するアプリ。


## 操作方法
事前に WordPress.com アカウントを取得してください。

1. [WordPress.com Subscriber](http://masakura.github.io/wordpresscom-subscribe/) にアクセス
2. WordPress.com に移動しますので、ログイン後に `Approval` ボタンをクリック
3. テキストボックスに `masakura.wordpress.com` などの WordPress.com のドメインを入力
4. `購読` ボタンをクリック
5. しばらくすると、記事の最新 20 件が表示されます


* 購読するドメインを記憶していません
* どの記事がどのドメインのものかが分かりません
* あくまでサンプルです...


## 学習すること
### 無名関数の即時実行を使う
JavaScript はついグローバルな領域に書きたくなるけど、コードが増えるに連れて問題が出やすくなるので、なるべく避けること。無名関数の即時実行でぐぐれば出てくる。

```javascript
(function () {
  // ここにコードを書く
})();
```


### strict モードを使う
JavaScript は標準ではバグを生みやすい挙動が多く、コードが増えるに連れて問題が出やすくなるので、strict モードを使おう。これもググれば出てくる。

無名関数の即時実行と合わせて使う。

```javascript
(function () {
  'use strict';

  // ここにコードを書く
})();
```


### map 関数を覚えよう!
map 関数を使うと、コードが短くなる。コードが短くなるということはバグが減る。詳細はぐぐってね!

```javascript
// 結果は [1, 4, 9] となる
[1, 2, 3].map(function (i) { return i * i; });
```


### Promise を覚えよう!
Promise は ECMAScript 6 で標準化された、非同期処理を簡単に書ける仕組み。jQuery は Deferred という Promise のすごいやつが使える。Promise は普及しているので、これを機会に覚えよう! 詳細はぐぐってね!

```javascript
$.ajax({
  url: 'http://...',
  type: 'GET'
})
  .then(function (data) {
    // 正常に終わったらここが呼び出される
  })
  .fail(function (error) {
    // エラーがあったらここが呼び出される
  });
```


### == は使うな!
`==` は敵です。使ってはいけない。何も考えずに `===` を使いましょう。


### OAuth2 について
WordPress.com の場合だけど...

ToDo あとで書く


### API の呼び出し
Developer Console が便利なので、そちらでu練習しながらするとイメージがつきやすい
