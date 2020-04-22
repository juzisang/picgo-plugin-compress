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
    required: true,
  },
  {
    name: 'nameType',
    type: 'list',
    choice: ['timestamp', 'none'],
    default: 'timestamp',
    required: true,
  },
  {
    name: 'tinypngKey',
    type: 'input',
    required: false,
  },
]
```
