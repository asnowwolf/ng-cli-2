# 这是什么？

这是官方Angular CLI版本(<https://github.com/angular/angular-cli>)的一个定制版，主要有如下改动：

1. 支持把HTML/CSS中内嵌的图片编译在项目中，小文件会被内联为Base64。
2. 支持把HTML中通过<img src="./path/to/file.svg">引入的图片就地展开，以便让css应用于svg元素。
3. 支持组件样式（Component Styles）文件的source mapping，使其可以正常调试。但需要等我的一个PR <https://github.com/angular/angular/pull/14175> 被接受之后才能生效，在此之前，请手动合并这些修改来试验效果。

# 如何使用？

1. 卸载官方原有cli：`npm r -g angular-cli`和`npm r -g @angular/cli`（新版包名）
2. 建议使用Node 6.x的最新版作为运行环境
3. 安装本工程`npm i -g https://github.com/asnowwolf/ng-cli-2.git#v1.0.0-beta.30`，安装完成后，将提供一个全局的ng命令
4. 之后的用法和官方cli完全相同

