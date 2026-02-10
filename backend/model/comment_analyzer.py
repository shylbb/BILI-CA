# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import openai
from pathlib import Path
from typing import List, Dict, Optional


class DefaultFreeAnalyzer:
    """默认免费分析器 - 使用百度ERNIE Bot"""
    
    def __init__(self):
        """初始化默认分析器"""
        try:
            # 尝试导入百度ERNIE Bot SDK
            from erniebot import ChatCompletion
            self.use_ernie = True
            print("已启用百度ERNIE Bot进行评论分析")
        except ImportError:
            self.use_ernie = False
            print("百度ERNIE Bot SDK未安装，使用本地实现")
    
    async def summarize_comments(self, comments: List[str], max_length: int = 20) -> List[str]:
        """批量总结评论
        
        Args:
            comments: 评论列表
            max_length: 总结的最大长度（字数）
            
        Returns:
            List[str]: 总结后的评论列表
        """
        if self.use_ernie:
            return await self._ernie_summarize(comments, max_length)
        else:
            return await self._local_summarize(comments, max_length)
    
    async def classify_comments(self, comments: List[str]) -> List[str]:
        """批量分类评论
        
        Args:
            comments: 评论列表
            
        Returns:
            List[str]: 分类结果列表（优/良/中/差/不明意义）
        """
        if self.use_ernie:
            return await self._ernie_classify(comments)
        else:
            return await self._local_classify(comments)
    
    async def _ernie_summarize(self, comments: List[str], max_length: int = 20) -> List[str]:
        """使用ERNIE Bot总结评论
        
        Args:
            comments: 评论列表
            max_length: 总结的最大长度（字数）
            
        Returns:
            List[str]: 总结后的评论列表
        """
        try:
            from erniebot import ChatCompletion
            
            summaries = []
            # 分批处理，每批最多5条评论
            batch_size = 5
            
            for i in range(0, len(comments), batch_size):
                batch = comments[i:i+batch_size]
                
                # 构建提示
                prompt = f"请将以下每条评论总结为{max_length}字左右的简洁描述，保持原意：\n\n"
                for j, comment in enumerate(batch, 1):
                    prompt += f"{j}. {comment}\n"
                
                # 调用ERNIE Bot API
                response = ChatCompletion.create(
                    model="ernie-3.5",
                    messages=[
                        {"role": "system", "content": "你是一个专业的评论总结助手，擅长提炼评论的核心观点。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=500
                )
                
                # 解析结果
                summary_text = response.get('result', '')
                batch_summaries = [line.split('. ', 1)[1] if '. ' in line else line 
                                for line in summary_text.strip().split('\n') if line]
                
                summaries.extend(batch_summaries[:len(batch)])
                
                # 避免请求过快
                import asyncio
                await asyncio.sleep(0.5)
            
            return summaries[:len(comments)]
            
        except Exception as e:
            print(f"ERNIE Bot总结失败: {str(e)}")
            # 失败时使用本地实现
            return await self._local_summarize(comments, max_length)
    
    async def _ernie_classify(self, comments: List[str]) -> List[str]:
        """使用ERNIE Bot分类评论
        
        Args:
            comments: 评论列表
            
        Returns:
            List[str]: 分类结果列表（优/良/中/差/不明意义）
        """
        try:
            from erniebot import ChatCompletion
            
            classifications = []
            # 分批处理，每批最多5条评论
            batch_size = 5
            
            for i in range(0, len(comments), batch_size):
                batch = comments[i:i+batch_size]
                
                # 构建提示
                prompt = "请将以下每条评论分类为：优（非常正面）、良（比较正面）、中（中性）、差（负面）、不明意义（无法判断）\n\n"
                for j, comment in enumerate(batch, 1):
                    prompt += f"{j}. {comment}\n"
                
                # 调用ERNIE Bot API
                response = ChatCompletion.create(
                    model="ernie-3.5",
                    messages=[
                        {"role": "system", "content": "你是一个专业的评论分类助手，擅长根据评论内容判断情感倾向。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=500
                )
                
                # 解析结果
                classification_text = response.get('result', '')
                batch_classifications = [line.split('. ', 1)[1] if '. ' in line else line 
                                      for line in classification_text.strip().split('\n') if line]
                
                classifications.extend(batch_classifications[:len(batch)])
                
                # 避免请求过快
                import asyncio
                await asyncio.sleep(0.5)
            
            return classifications[:len(comments)]
            
        except Exception as e:
            print(f"ERNIE Bot分类失败: {str(e)}")
            # 失败时使用本地实现
            return await self._local_classify(comments)
    
    async def _local_summarize(self, comments: List[str], max_length: int = 20) -> List[str]:
        """本地总结评论（备用实现）
        
        Args:
            comments: 评论列表
            max_length: 总结的最大长度（字数）
            
        Returns:
            List[str]: 总结后的评论列表
        """
        summaries = []
        for comment in comments:
            # 简单实现：截取前max_length个字符
            summary = comment[:max_length]
            if len(comment) > max_length:
                summary += "..."
            summaries.append(summary)
        return summaries
    
    async def _local_classify(self, comments: List[str]) -> List[str]:
        """本地分类评论（备用实现）
        
        Args:
            comments: 评论列表
            
        Returns:
            List[str]: 分类结果列表（优/良/中/差/不明意义）
        """
        classifications = []
        # 正面关键词
        positive_words = ['好', '棒', '优秀', '喜欢', '赞', '精彩', '完美', '满意', '支持', '厉害']
        # 负面关键词
        negative_words = ['差', '糟糕', '垃圾', '失望', '讨厌', '不满', '反对', '无聊', '错误', '失败']
        
        for comment in comments:
            comment_lower = comment.lower()
            pos_count = sum(1 for word in positive_words if word in comment_lower)
            neg_count = sum(1 for word in negative_words if word in comment_lower)
            
            if pos_count > neg_count:
                if pos_count >= 2:
                    classifications.append('优')
                else:
                    classifications.append('良')
            elif neg_count > pos_count:
                classifications.append('差')
            else:
                classifications.append('中')
        return classifications


class OpenAIAnalyzer:
    """OpenAI分析器"""
    
    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo"):
        """初始化OpenAI分析器
        
        Args:
            api_key: OpenAI API密钥
            model: 使用的模型名称
        """
        openai.api_key = api_key
        self.model = model
    
    async def summarize_comments(self, comments: List[str], max_length: int = 20) -> List[str]:
        """批量总结评论
        
        Args:
            comments: 评论列表
            max_length: 总结的最大长度（字数）
            
        Returns:
            List[str]: 总结后的评论列表
        """
        # 构建提示
        prompt = f"请将以下每条评论总结为{max_length}字左右的简洁描述，保持原意：\n\n"
        for i, comment in enumerate(comments, 1):
            prompt += f"{i}. {comment}\n"
        
        # 调用API
        response = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=[
                {"role": "system", "content": "你是一个专业的评论总结助手，擅长提炼评论的核心观点。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # 解析结果
        summary_text = response.choices[0].message.content
        summaries = [line.split('. ', 1)[1] if '. ' in line else line 
                    for line in summary_text.strip().split('\n') if line]
        
        return summaries[:len(comments)]
    
    async def classify_comments(self, comments: List[str]) -> List[str]:
        """批量分类评论
        
        Args:
            comments: 评论列表
            
        Returns:
            List[str]: 分类结果列表（优/良/中/差/不明意义）
        """
        # 构建提示
        prompt = "请将以下每条评论分类为：优（非常正面）、良（比较正面）、中（中性）、差（负面）、不明意义（无法判断）\n\n"
        for i, comment in enumerate(comments, 1):
            prompt += f"{i}. {comment}\n"
        
        # 调用API
        response = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=[
                {"role": "system", "content": "你是一个专业的评论分类助手，擅长根据评论内容判断情感倾向。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500
        )
        
        # 解析结果
        classification_text = response.choices[0].message.content
        classifications = [line.split('. ', 1)[1] if '. ' in line else line 
                          for line in classification_text.strip().split('\n') if line]
        
        return classifications[:len(comments)]


class OtherAPIAnalyzer:
    """其他API分析器（预留接口）"""
    
    def __init__(self, api_key: str, model: str = "default"):
        """初始化其他API分析器
        
        Args:
            api_key: API密钥
            model: 使用的模型名称
        """
        self.api_key = api_key
        self.model = model
    
    async def summarize_comments(self, comments: List[str], max_length: int = 20) -> List[str]:
        """批量总结评论
        
        Args:
            comments: 评论列表
            max_length: 总结的最大长度（字数）
            
        Returns:
            List[str]: 总结后的评论列表
        """
        # 暂时使用默认实现
        analyzer = DefaultFreeAnalyzer()
        return await analyzer.summarize_comments(comments, max_length)
    
    async def classify_comments(self, comments: List[str]) -> List[str]:
        """批量分类评论
        
        Args:
            comments: 评论列表
            
        Returns:
            List[str]: 分类结果列表（优/良/中/差/不明意义）
        """
        # 暂时使用默认实现
        analyzer = DefaultFreeAnalyzer()
        return await analyzer.classify_comments(comments)


class CommentAnalyzer:
    """评论分析器（工厂模式）"""
    
    def __init__(self, model_type: str = "default", api_key: Optional[str] = None, model: str = "gpt-3.5-turbo"):
        """初始化分析器
        
        Args:
            model_type: 模型类型（default/openai/other）
            api_key: API密钥（对于需要的模型）
            model: 使用的模型名称
        """
        if model_type == "default":
            self.analyzer = DefaultFreeAnalyzer()
        elif model_type == "openai":
            if not api_key:
                raise ValueError("OpenAI模型需要API密钥")
            self.analyzer = OpenAIAnalyzer(api_key, model)
        elif model_type == "other":
            if not api_key:
                raise ValueError("其他API模型需要API密钥")
            self.analyzer = OtherAPIAnalyzer(api_key, model)
        else:
            raise ValueError(f"不支持的模型类型: {model_type}")
    
    async def summarize_comments(self, comments: List[str], max_length: int = 20) -> List[str]:
        """批量总结评论
        
        Args:
            comments: 评论列表
            max_length: 总结的最大长度（字数）
            
        Returns:
            List[str]: 总结后的评论列表
        """
        return await self.analyzer.summarize_comments(comments, max_length)
    
    async def classify_comments(self, comments: List[str]) -> List[str]:
        """批量分类评论
        
        Args:
            comments: 评论列表
            
        Returns:
            List[str]: 分类结果列表（优/良/中/差/不明意义）
        """
        return await self.analyzer.classify_comments(comments)
    
    async def process_batch(self, input_file: Path, batch_size: int = 10) -> Path:
        """批量处理评论
        
        Args:
            input_file: 清洗后的评论文件路径
            batch_size: 批量处理大小
            
        Returns:
            Path: 分析结果文件路径
        """
        output_file = input_file.with_name(f"{input_file.stem}_analyzed.jsonl")
        comments = []
        comment_datas = []
        
        # 读取评论
        with open(input_file, 'r', encoding='utf-8') as f:
            for line in f:
                comment_data = json.loads(line.strip())
                comments.append(comment_data['cleaned_text'])
                comment_datas.append(comment_data)
        
        # 分批处理
        results = []
        for i in range(0, len(comments), batch_size):
            batch_comments = comments[i:i+batch_size]
            batch_datas = comment_datas[i:i+batch_size]
            
            # 总结
            summaries = await self.summarize_comments(batch_comments)
            # 分类
            classifications = await self.classify_comments(batch_comments)
            
            for data, summary, classification in zip(batch_datas, summaries, classifications):
                data['summary'] = summary
                data['classification'] = classification
                results.append(data)
        
        # 保存结果
        with open(output_file, 'w', encoding='utf-8') as f:
            for result in results:
                json.dump(result, f, ensure_ascii=False)
                f.write('\n')
        
        return output_file
