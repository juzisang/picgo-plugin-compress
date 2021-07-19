# 极限压缩lubanforgitee说明

# 为什么用gitee作为图床?

因为github上传图片(push)太慢了,基本都要5-6s. 写blog时比较影响体验.

jsdelivery只是用来加速访问,并不能加速上传,它只是个CDN而已,不是梯子.

gitee国内能直接访问,上传速度很快,基本1-2s.质的不同.

# gitee的限制

1M以上的图片能上传,但不能匿名访问,必须带登录态.

所以我们要尽全力把图片压缩到1M以下. 且越小越好.

使用的picgo插件: gitee 2.0.3  

# 压缩策略

## png

判断有没有半透明像素(而不只是判断透明通道) : (目前暂未实现,所以统一转换成jpg)

有半透明像素,用pngquant压缩

没有半透明像素,就用把图片格式转变为jpg,然后用jpg的压缩方式

> mac和windows很多截图软件拿到的图都是png,很大,变成jpg能减少50%-90%不等的文件大小. 

![image-20210719110848321](https://gitee.com/hss012489/picbed/raw/master/picgo/1626664128349-image-20210719110848321.jpg)

## jpg

> 原则: 尽量不改变图片尺寸. 只改变图片质量.

阈值1M

优先改变图片质量: 75->65->55->45->35  

还很大,就再降低采样率.

(一般来说,降低图片质量,降低采样率,图片的鲜艳程度会有一点降低,但还能接受.)

降低采用率后还是很大,那只能改变图片尺寸了. 这个是最立杠见影的.但对于一些图大字小的情况,尺寸改变后,字可能会看不清.

尺寸太大的图,可能会OOM,需要自己预先压缩尺寸后放入,比如一亿像素的图.

![image-20210719105612139](https://gitee.com/hss012489/picbed/raw/master/picgo/1626663372190-image-20210719105612139.jpg)

## gif

使用gifsicile来压缩.要统一降到1M以下,会压缩得比较狠,颜色32bit->16bit->8bit.

原图:

![image-20210719110537419](https://gitee.com/hss012489/picbed/raw/master/picgo/1626663937449-image-20210719110537419.jpg)

压到1M以下后:

![image-20210719110704465](https://gitee.com/hss012489/picbed/raw/master/picgo/1626664024494-image-20210719110704465.jpg)

![54801d6475b29239e55e90cf9666e388c3feef09464efcbea9a8593ff4f27321](https://gitee.com/hss012489/picbed/raw/master/picgo/1626663910922-1626663875315-54801d6475b29239e55e90cf9666e388c3feef09464efcbea9a8593ff4f27321.gif)

## webp

不压缩