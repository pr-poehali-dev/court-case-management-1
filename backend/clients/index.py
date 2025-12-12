import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с клиентами: получение списка, создание, обновление
    Поддерживает физических и юридических лиц
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
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = '''
                    SELECT 
                        c.*,
                        (SELECT COUNT(*) FROM cases WHERE client_id = c.id) as cases_count
                    FROM clients c
                    ORDER BY c.created_at DESC
                '''
                cur.execute(query)
                clients = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps([dict(row) for row in clients], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            client_type = body.get('type')
            
            with conn.cursor() as cur:
                if client_type == 'физическое':
                    cur.execute('''
                        INSERT INTO clients 
                        (type, full_name, contact_info, address, passport_series_number, date_of_birth)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id
                    ''', (
                        client_type,
                        body.get('full_name'),
                        json.dumps(body.get('contact_info', {})),
                        body.get('address'),
                        body.get('passport_series_number'),
                        body.get('date_of_birth')
                    ))
                else:
                    cur.execute('''
                        INSERT INTO clients 
                        (type, company_name, contact_info, address, inn, kpp, ogrn, legal_address)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    ''', (
                        client_type,
                        body.get('company_name'),
                        json.dumps(body.get('contact_info', {})),
                        body.get('address'),
                        body.get('inn'),
                        body.get('kpp'),
                        body.get('ogrn'),
                        body.get('legal_address')
                    ))
                
                client_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'id': client_id, 'message': 'Клиент создан'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            client_id = body.get('id')
            client_type = body.get('type')
            
            with conn.cursor() as cur:
                if client_type == 'физическое':
                    cur.execute('''
                        UPDATE clients 
                        SET full_name = %s, contact_info = %s, address = %s,
                            passport_series_number = %s, date_of_birth = %s
                        WHERE id = %s
                    ''', (
                        body.get('full_name'),
                        json.dumps(body.get('contact_info', {})),
                        body.get('address'),
                        body.get('passport_series_number'),
                        body.get('date_of_birth'),
                        client_id
                    ))
                else:
                    cur.execute('''
                        UPDATE clients 
                        SET company_name = %s, contact_info = %s, address = %s,
                            inn = %s, kpp = %s, ogrn = %s, legal_address = %s
                        WHERE id = %s
                    ''', (
                        body.get('company_name'),
                        json.dumps(body.get('contact_info', {})),
                        body.get('address'),
                        body.get('inn'),
                        body.get('kpp'),
                        body.get('ogrn'),
                        body.get('legal_address'),
                        client_id
                    ))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Клиент обновлен'}),
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
