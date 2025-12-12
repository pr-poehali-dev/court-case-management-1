import json
import os
import psycopg2
import psycopg2.extras
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления издержками по делам
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        if method == 'GET':
            cursor.execute('''
                SELECT 
                    e.*,
                    c.title as case_title
                FROM expenses e
                LEFT JOIN cases c ON e.case_id = c.id
                ORDER BY e.date DESC, e.created_at DESC
            ''')
            
            expenses = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(e) for e in expenses], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO expenses (
                    case_id, type, amount, date, description, status
                ) VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, case_id, type, amount, date, description, 
                          status, created_at
            ''', (
                body_data.get('case_id'),
                body_data['type'],
                body_data['amount'],
                body_data['date'],
                body_data.get('description'),
                body_data.get('status', 'планируемые')
            ))
            
            expense = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(expense), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            expense_id = body_data.get('id')
            
            cursor.execute('''
                UPDATE expenses
                SET type = %s,
                    amount = %s,
                    date = %s,
                    description = %s,
                    status = %s
                WHERE id = %s
                RETURNING id, case_id, type, amount, date, description,
                          status, created_at
            ''', (
                body_data.get('type'),
                body_data.get('amount'),
                body_data.get('date'),
                body_data.get('description'),
                body_data.get('status'),
                expense_id
            ))
            
            expense = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(expense) if expense else {}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            expense_id = query_params.get('id')
            
            cursor.execute('DELETE FROM expenses WHERE id = %s', (expense_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Expense deleted'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
