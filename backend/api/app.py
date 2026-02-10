# -*- coding: utf-8 -*-
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import asyncio
import json
import os

from backend.crawler.bilibili_crawler import BilibiliCrawler
from backend.processor.comment_processor import CommentProcessor
from backend.model.comment_analyzer import CommentAnalyzer

app = FastAPI(title="评论分析系统API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 存储处理任务状态
tasks = {}

class CrawlRequest(BaseModel):
    bvid: str
    max_comments: int = 10000

class AnalyzeRequest(BaseModel):
    file_path: str
    api_key: str
    model: str = "default"

class TaskStatus(BaseModel):
    task_id: str
    status: str
    progress: float
    result: dict | None = None

@app.post("/api/crawl", response_model=TaskStatus)
async def crawl_comments(request: CrawlRequest):
    """爬取哔哩哔哩评论"""
    task_id = f"task_{os.urandom(8).hex()}"
    tasks[task_id] = {"status": "running", "progress": 0}
    
    # 立即返回任务状态，然后在后台执行爬取
    async def crawl_background():
        try:
            crawler = BilibiliCrawler()
            tasks[task_id]["status"] = "crawling"
            tasks[task_id]["progress"] = 25
            
            try:
                file_path, comment_count = await asyncio.to_thread(crawler.crawl_comments, request.bvid, request.max_comments)
            except Exception as crawl_error:
                print(f"爬取评论失败: {str(crawl_error)}")
                tasks[task_id]["status"] = "failed"
                tasks[task_id]["progress"] = 0
                return
            
            tasks[task_id]["status"] = "processing"
            tasks[task_id]["progress"] = 50
            
            try:
                processor = CommentProcessor()
                cleaned_file, cleaned_count = await asyncio.to_thread(processor.process_comments, file_path)
            except Exception as process_error:
                print(f"处理评论失败: {str(process_error)}")
                tasks[task_id]["status"] = "failed"
                tasks[task_id]["progress"] = 0
                return
            
            tasks[task_id]["status"] = "completed"
            tasks[task_id]["progress"] = 100
            tasks[task_id]["result"] = {
                "file_path": str(cleaned_file),
                "comment_count": comment_count,
                "cleaned_count": cleaned_count
            }
        except Exception as e:
            print(f"任务执行失败: {str(e)}")
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["progress"] = 0
    
    # 启动后台任务
    asyncio.create_task(crawl_background())
    
    # 返回初始任务状态
    return TaskStatus(
        task_id=task_id,
        status="running",
        progress=0
    )

@app.post("/api/analyze", response_model=TaskStatus)
async def analyze_comments(request: AnalyzeRequest):
    """分析评论"""
    task_id = f"task_{os.urandom(8).hex()}"
    tasks[task_id] = {"status": "running", "progress": 0}
    
    # 立即返回任务状态，然后在后台执行分析
    async def analyze_background():
        try:
            input_file = Path(request.file_path)
            if not input_file.exists():
                tasks[task_id]["status"] = "failed"
                tasks[task_id]["progress"] = 0
                return
            
            try:
                analyzer = CommentAnalyzer(model_type=request.model, api_key=request.api_key)
            except Exception as analyzer_error:
                print(f"创建分析器失败: {str(analyzer_error)}")
                tasks[task_id]["status"] = "failed"
                tasks[task_id]["progress"] = 0
                return
            
            tasks[task_id]["status"] = "analyzing"
            tasks[task_id]["progress"] = 30
            
            try:
                result_file = await analyzer.process_batch(input_file)
            except Exception as analyze_error:
                print(f"分析评论失败: {str(analyze_error)}")
                tasks[task_id]["status"] = "failed"
                tasks[task_id]["progress"] = 0
                return
            
            tasks[task_id]["status"] = "completed"
            tasks[task_id]["progress"] = 100
            tasks[task_id]["result"] = {
                "result_file": str(result_file)
            }
        except Exception as e:
            print(f"任务执行失败: {str(e)}")
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["progress"] = 0
    
    # 启动后台任务
    asyncio.create_task(analyze_background())
    
    # 返回初始任务状态
    return TaskStatus(
        task_id=task_id,
        status="running",
        progress=0
    )

@app.get("/api/task/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """获取任务状态"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task = tasks[task_id]
    return TaskStatus(
        task_id=task_id,
        status=task["status"],
        progress=task["progress"],
        result=task.get("result")
    )

@app.get("/api/results/{file_path}")
async def get_results(file_path: str):
    """获取分析结果"""
    try:
        result_file = Path(file_path)
        if not result_file.exists():
            raise HTTPException(status_code=404, detail="结果文件不存在")
        
        # 统计分类结果
        classifications = {"优": 0, "良": 0, "中": 0, "差": 0, "不明意义": 0}
        summaries = []
        
        with open(result_file, 'r', encoding='utf-8') as f:
            for line in f:
                data = json.loads(line.strip())
                classification = data.get('classification', '不明意义')
                if classification in classifications:
                    classifications[classification] += 1
                summaries.append(data.get('summary', ''))
        
        return {
            "classifications": classifications,
            "total": sum(classifications.values()),
            "sample_summaries": summaries[:10]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api.app:app", host="0.0.0.0", port=8000, reload=True)
