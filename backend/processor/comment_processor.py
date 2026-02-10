# -*- coding: utf-8 -*-
from __future__ import annotations

import json
from pathlib import Path
import re


class CommentProcessor:
    """评论处理器"""
    
    def __init__(self):
        """初始化处理器"""
        # 定义正则表达式模式
        self.emoji_pattern = re.compile(r'[^\u4e00-\u9fa5a-zA-Z0-9\s，。！？；：""\'\'（）]')
        self.url_pattern = re.compile(r'https?://\S+')
        self.repeat_pattern = re.compile(r'(.)\1{4,}')  # 重复字符
    
    def clean_comment(self, comment: str) -> str:
        """清洗评论内容
        
        Args:
            comment: 原始评论内容
            
        Returns:
            str: 清洗后的评论内容
        """
        # 移除URL
        comment = self.url_pattern.sub('', comment)
        # 移除多余的表情和特殊字符
        comment = self.emoji_pattern.sub('', comment)
        # 移除重复字符
        comment = self.repeat_pattern.sub(r'\1', comment)
        # 移除多余空格
        comment = ' '.join(comment.split())
        return comment
    
    def process_comments(self, input_file: Path) -> tuple[Path, int]:
        """处理评论文件
        
        Args:
            input_file: 原始评论文件路径
            
        Returns:
            tuple[Path, int]: (清洗后的文件路径, 清洗后的评论数量)
        """
        output_file = input_file.with_name(f"{input_file.stem}_cleaned.jsonl")
        cleaned_count = 0
        
        with open(input_file, 'r', encoding='utf-8') as f, \
             open(output_file, 'w', encoding='utf-8') as out_f:
            for line in f:
                try:
                    comment_data = json.loads(line.strip())
                    cleaned_text = self.clean_comment(comment_data['text'])
                    
                    # 过滤过短评论
                    if len(cleaned_text) > 5:
                        comment_data['cleaned_text'] = cleaned_text
                        json.dump(comment_data, out_f, ensure_ascii=False)
                        out_f.write('\n')
                        cleaned_count += 1
                except Exception:
                    continue
        
        return output_file, cleaned_count
