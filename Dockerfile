FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 安装Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# 复制项目文件
COPY . .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 安装前端依赖并构建
RUN cd frontend && npm install && npm run build && cd ..

# 创建数据目录
RUN mkdir -p data/comments

# 暴露端口
EXPOSE 8000

# 启动服务
CMD ["python", "-m", "backend.api.app"]
