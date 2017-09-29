# nodethapp
# 介绍 #
这是为UBC TOKEN Package提供的节点监听服务。基于WEB3.js上的封装。

# 环境 #
  * go-ethereum 1.7+ stable
  * PostgreSQL 9.6+
  * redis 3.2.8+
  * node 6.11+
  * npm 3.10.10+

# 代码结构 #
  * api/ 代码目录
    * controller 接口控制器
    * domain 数据映射：redis，postgres
    * model 业务实现
  * node_modules/ 工具包目录
  * app.js 接口映射
  * package.json 
  * api.define.json 接口说明

# 接口说明 #
参考文件 api.define.json

# 环境初始化 #
这里认为环境已经安装好

## 数据库 ##
  * createuser -P nodebitapp -U postgres
  * createdb -O nodebitapp nodebitapp -U postgres
  



