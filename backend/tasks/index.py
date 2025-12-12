import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с задачами: получение списка, создание, обновление статуса
    Поддерживает фильтрацию по делу и исполнителю
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            case_id = params.get('case_id')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if case_id:
                    query = '''
                        SELECT 
                            t.*,
                            tt.name as type_name,
                            p.name as priority_name,
                            p.color_code as priority_color,
                            u.full_name as assigned_to_name,
                            c.title as case_title
                        FROM tasks t
                        LEFT JOIN task_types tt ON t.type_id = tt.id
                        LEFT JOIN priorities p ON t.priority_id = p.id
                        LEFT JOIN users u ON t.assigned_to = u.id
                        LEFT JOIN cases c ON t.case_id = c.id
                        WHERE t.case_id = %s
                        ORDER BY t.due_date ASC
                    '''
                    cur.execute(query, (case_id,))
                else:
                    query = '''
                        SELECT 
                            t.*,
                            tt.name as type_name,
                            p.name as priority_name,
                            p.color_code as priority_color,
                            u.full_name as assigned_to_name,
                            c.title as case_title
                        FROM tasks t
                        LEFT JOIN task_types tt ON t.type_id = tt.id
                        LEFT JOIN priorities p ON t.priority_id = p.id
                        LEFT JOIN users u ON t.assigned_to = u.id
                        LEFT JOIN cases c ON t.case_id = c.id
                        ORDER BY t.due_date ASC
                    '''
                    cur.execute(query)
                
                tasks = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps([dict(row) for row in tasks], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            with conn.cursor() as cur:
                cur.execute('''
                    INSERT INTO tasks 
                    (title, description, due_date, status, case_id, type_id, priority_id, created_by, assigned_to)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (
                    body.get('title'),
                    body.get('description'),
                    body.get('due_date'),
                    body.get('status', 'новая'),
                    body.get('case_id'),
                    body.get('type_id'),
                    body.get('priority_id'),
                    body.get('created_by'),
                    body.get('assigned_to')
                ))
                task_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'id': task_id, 'message': 'Задача создана'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            task_id = body.get('id')
            
            with conn.cursor() as cur:
                cur.execute('''
                    UPDATE tasks 
                    SET title = %s, description = %s, due_date = %s, status = %s,
                        priority_id = %s, assigned_to = %s, result_comment = %s,
                        actual_date = CASE WHEN %s = 'выполнена' THEN CURRENT_TIMESTAMP ELSE actual_date END
                    WHERE id = %s
                ''', (
                    body.get('title'),
                    body.get('description'),
                    body.get('due_date'),
                    body.get('status'),
                    body.get('priority_id'),
                    body.get('assigned_to'),
                    body.get('result_comment'),
                    body.get('status'),
                    task_id
                ))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Задача обновлена'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    finally:
        conn.close()
