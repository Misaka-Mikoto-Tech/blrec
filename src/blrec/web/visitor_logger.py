
import time
import random
from datetime import datetime
from typing import Dict

from fastapi import Request

class Session:
    ip: str
    lastVisit: datetime

cached_session: Dict[str, Session] = {}
log_file_path: str = ''
kCache_Time = 3600 * 10 # 缓存时间

def generate_unique_id():
    timestamp = int(time.time() * 1000)
    rand_num = random.randint(0, 1000)
    unique_id = '{}{}'.format(timestamp, rand_num)
    return unique_id

def log_visitor(request: Request):
    """记录web端访问IP"""
    global cached_session
    global log_file_path

    if not log_file_path:
        from .main import app
        logging = app.get_settings().logging
        log_file_path = f"{logging.log_dir if logging else '/log'}/visitor.log"

    ip = request.client.host if request.client else ''

    # 过滤本地IP和已知IP
    if not ip or ip.startswith('192.168.') or ip.startswith('::') or ip.startswith('127.0.'):
        return
    
    update_cache()

    session = cached_session.get(ip)
    if not session:
        session = Session()
        session.ip = ip
        session.lastVisit = datetime.now()
        cached_session[ip] = session

        # 新 session 则写入日志
        with open(log_file_path, 'a') as f:
            # 2023-10-30 10:52:18   127.0.0.1   上海市
            f.write(f"{session.lastVisit.strftime('%Y-%m-%d %H:%M:%S')}\t{session.ip}\n")
    else:
        session.lastVisit = datetime.now()


def update_cache():
    now = datetime.now()
    remove_lst = [k for k,v in cached_session.items() if ((now - v.lastVisit).total_seconds() > kCache_Time) ]
    for k in remove_lst:
        del cached_session[k]