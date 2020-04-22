# picgo-plugin-compress

## 安装

```bash
picgo add compress
```

## 配置

```js
;[
  {
    name: 'compress',
    type: 'list',
    choice: ['imagemin', 'tinypng', 'none'],
    default: 'imagemin',
  },
  {
    name: 'nameType',
    type: 'list',
    choice: ['timestamp', 'none'],
    default: 'timestamp',
  },
  {
    name: 'tinypngKey',
    type: 'input',
  },
]
```
