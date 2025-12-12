import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с делами: получение списка, создание, обновление, удаление
    Методы: GET - список дел, POST - создание дела, PUT - обновление, DELETE - удаление
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = '''
                    SELECT 
                        c.*,
                        cl.full_name as client_name,
                        cl.company_name as client_company,
                        u.full_name as responsible_name,
                        (SELECT COUNT(*) FROM tasks WHERE case_id = c.id) as tasks_count,
                        (SELECT COUNT(*) FROM tasks WHERE case_id = c.id AND status = 'выполнена') as completed_tasks
                    FROM cases c
                    LEFT JOIN clients cl ON c.client_id = cl.id
                    LEFT JOIN users u ON c.responsible_user_id = u.id
                    ORDER BY c.created_at DESC
                '''
                cur.execute(query)
                cases = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps([dict(row) for row in cases], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            with conn.cursor() as cur:
                cur.execute('''
                    INSERT INTO cases 
                    (internal_number, external_number, title, description, status, type, client_id, responsible_user_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (
                    body.get('internal_number'),
                    body.get('external_number'),
                    body.get('title'),
                    body.get('description'),
                    body.get('status', 'открыто'),
                    body.get('type'),
                    body.get('client_id'),
                    body.get('responsible_user_id')
                ))
                case_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'id': case_id, 'message': 'Дело создано'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            case_id = body.get('id')
            
            with conn.cursor() as cur:
                cur.execute('''
                    UPDATE cases 
                    SET title = %s, description = %s, status = %s, type = %s,
                        client_id = %s, responsible_user_id = %s, external_number = %s
                    WHERE id = %s
                ''', (
                    body.get('title'),
                    body.get('description'),
                    body.get('status'),
                    body.get('type'),
                    body.get('client_id'),
                    body.get('responsible_user_id'),
                    body.get('external_number'),
                    case_id
                ))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Дело обновлено'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            case_id = params.get('id')
            
            with conn.cursor() as cur:
                cur.execute('UPDATE cases SET status = %s WHERE id = %s', ('архив', case_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Дело архивировано'}),
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
