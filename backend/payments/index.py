import json
import os
import psycopg2
import psycopg2.extras
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления оплатами по делам
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
                    p.*,
                    c.title as case_title,
                    COALESCE(cl.full_name, cl.company_name) as client_name
                FROM payments p
                LEFT JOIN cases c ON p.case_id = c.id
                LEFT JOIN clients cl ON p.client_id = cl.id
                ORDER BY p.date DESC, p.created_at DESC
            ''')
            
            payments = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(p) for p in payments], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO payments (
                    case_id, client_id, amount, date, purpose, 
                    document_number, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, case_id, client_id, amount, date, purpose, 
                          document_number, status, created_at
            ''', (
                body_data.get('case_id'),
                body_data.get('client_id'),
                body_data['amount'],
                body_data['date'],
                body_data.get('purpose'),
                body_data.get('document_number'),
                body_data.get('status', 'ожидается')
            ))
            
            payment = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(payment), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            payment_id = body_data.get('id')
            
            cursor.execute('''
                UPDATE payments
                SET amount = %s,
                    date = %s,
                    purpose = %s,
                    document_number = %s,
                    status = %s
                WHERE id = %s
                RETURNING id, case_id, client_id, amount, date, purpose,
                          document_number, status, created_at
            ''', (
                body_data.get('amount'),
                body_data.get('date'),
                body_data.get('purpose'),
                body_data.get('document_number'),
                body_data.get('status'),
                payment_id
            ))
            
            payment = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(payment) if payment else {}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            payment_id = query_params.get('id')
            
            cursor.execute('DELETE FROM payments WHERE id = %s', (payment_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Payment deleted'}),
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
