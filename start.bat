@echo off

rem 启动脚本

echo === 哔哩哔哩评论分析系统启动脚本 ===
echo.

rem 检查Python版本
echo 检查Python版本...
python --version
echo.

rem 安装Python依赖
echo 安装Python依赖...
pip install -r requirements.txt
echo.

rem 安装前端依赖
echo 安装前端依赖...
cd frontend
npm install
npm run build
cd ..
echo.

rem 启动后端服务
echo 启动后端服务...
python -m backend.api.app
pause
