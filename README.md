# BILI-CA - 哔哩哔哩评论分析系统

个人练习项目，用于爬取哔哩哔哩视频评论，使用免费大模型进行分析，并通过可视化界面展示结果。

## 项目简介

这是一个个人练习用的全栈项目，旨在学习前后端分离开发、API集成、数据爬取和大模型应用等技术。项目实现了从Bilibili爬取真实评论，使用百度ERNIE Bot等免费大模型进行分析，并通过React前端展示结果的完整流程。

## 演示

<img width="692" height="390" alt="image" src="https://github.com/user-attachments/assets/c899b09c-3738-4151-9e01-0d5ebc54391f" />

<img width="692" height="385" alt="image" src="https://github.com/user-attachments/assets/7c9d90ab-5e78-415d-a304-b196605c4401" />


## 功能特性

- 🐍 **Python后端**：FastAPI + 异步处理
- ⚛️ **React前端**：Vite + TypeScript + TailwindCSS
- 📊 **数据可视化**：Recharts图表展示分析结果
- 🤖 **大模型集成**：百度ERNIE Bot免费模型 + OpenAI API
- 🐳 **Docker支持**：容器化部署
- 🔄 **实时进度**：任务执行进度实时显示
- 📱 **响应式设计**：适配不同屏幕尺寸

## 项目结构

```
BILI-CA/
├── backend/                # 后端服务
│   ├── api/                # API接口
│   ├── crawler/            # Bilibili评论爬取
│   ├── processor/          # 数据处理
│   └── model/              # 大模型集成
├── frontend/               # 前端应用
│   ├── src/                # 源代码
│   │   ├── components/     # 组件
│   │   ├── App.tsx         # 主应用
│   │   └── main.tsx        # 入口文件
│   └── package.json        # 前端依赖
├── data/                   # 数据存储
├── requirements.txt        # Python依赖
├── start.bat               # Windows启动脚本
├── start.sh                # Linux启动脚本
├── Dockerfile              # Docker构建文件
├── docker-compose.yml      # Docker Compose配置
└── README.md               # 项目说明
```

## 技术栈

### 后端
- **语言**：Python 3.10+
- **框架**：FastAPI
- **爬虫**：bilibili-api-python
- **大模型**：百度ERNIE Bot (默认免费模型) + OpenAI API
- **数据格式**：JSONL

### 前端
- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式**：TailwindCSS
- **图表**：Recharts

## 快速开始

### 1. 安装依赖

```bash
# 后端依赖
pip install -r requirements.txt

# 前端依赖
cd frontend
npm install
```

### 2. 启动服务

```bash
# 方法一：使用启动脚本
# Windows
start.bat
# Linux/Mac
bash start.sh

# 方法二：手动启动
# 启动后端
python -m backend.api.app

# 启动前端（新终端）
cd frontend
npm run dev
```

### 3. 访问应用

打开浏览器访问 `http://localhost:3000/`

## 使用说明

1. **输入视频BV号**：例如 `BV1xx411c7mW`
2. **设置最大评论数**：限制爬取的评论数量
3. **选择模型**：
   - 默认免费模型（百度ERNIE Bot）
   - OpenAI API（需要输入API密钥）
   - 其他API（预留接口）
4. **点击"开始分析"**：系统会自动爬取评论并进行分析
5. **查看结果**：分析完成后会显示分类统计和可视化图表

## 核心功能

### 1. 真实评论爬取
- 从Bilibili获取真实的视频评论
- 支持分页获取，自动处理API限制
- 严格遵守最大评论数限制
- 实时显示爬取进度

### 2. 智能评论分析
- 使用百度ERNIE Bot进行评论分类和总结
- 支持批处理，提高分析效率
- 智能降级：当API不可用时使用本地实现

### 3. 数据可视化
- 饼图展示评论分类分布
- 详细的分析结果表格
- 支持查看历史分析任务

## 技术亮点

1. **模块化设计**：清晰的代码结构，易于维护和扩展
2. **异步处理**：使用FastAPI后台任务，提高系统响应速度
3. **多层降级**：爬虫和分析都实现了多层降级方案，确保系统稳定性
4. **数据验证**：使用Pydantic进行数据验证，提高代码质量
5. **工厂模式**：大模型集成使用工厂模式，便于扩展新模型

## 注意事项

1. **API限制**：Bilibili API有请求频率限制，爬取大量评论时可能会被限流
2. **网络连接**：确保网络连接稳定，特别是在爬取和分析过程中
3. **数据存储**：爬取的评论会保存在本地，大量数据可能占用较多磁盘空间

## 依赖说明

### Python依赖
- fastapi==0.104.1
- uvicorn==0.24.0.post1
- bilibili-api-python==17.4.1
- openai==1.3.5
- erniebot==0.5.0
- pydantic==2.5.2

### 前端依赖
- react==18.2.0
- react-dom==18.2.0
- recharts==2.10.4
- axios==1.6.2
- tailwindcss==3.3.5
- typescript==5.2.2
- vite==5.0.0

## 学习目标

- 熟悉前后端分离开发流程
- 掌握FastAPI和React的基本使用
- 学习如何使用Python进行数据爬取
- 了解大模型API的集成和应用
- 练习Docker容器化部署

## 许可证

MIT License

---

**个人练习项目，用于学习全栈开发和AI应用技术**
