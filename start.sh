#!/bin/bash

# 启动脚本

echo "=== 哔哩哔哩评论分析系统启动脚本 ==="
echo ""

# 检查Python版本
echo "检查Python版本..."
python --version

# 安装Python依赖
echo ""
echo "安装Python依赖..."
pip install -r requirements.txt

# 安装前端依赖
echo ""
echo "安装前端依赖..."
cd frontend
npm install
npm run build
cd ..

# 启动后端服务
echo ""
echo "启动后端服务..."
python -m backend.api.app
