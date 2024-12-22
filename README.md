# AC Counter

## 事前準備

- Node 16
- yarn

## 導入

### API

```bash
cd api
nvm use 16
yarn
cp .env.sample .env
```

### Web

```bash
cd web
nvm use 16
yarn
cp .env.sample .env.local
```

## ローカル実行

### API

```bash
cd api
yarn start:dev
```

## Web


```bash
cd web
yarn start
```

## 省略コマンド

自分の作業用に作ってるだけなので、他環境(Macとか)で動くかは知らない。  
(当方はWin端末のWSL)

```bash
# api
cd api && ./a
# web
cd web && ./a
```
