import os
import django
from django.db import connection

f = open('d:\\Sistema_Inventario_Trilaleo\\agregar_columnas_faltantes.sql')
sql = f.read()
queries = [q.strip() for q in sql.split(';') if q.strip() and not q.strip().startswith('--')]

try:
    with connection.cursor() as cursor:
        for q in queries:
            cursor.execute(q)
    print("SQL ejecutado correctamente")
except Exception as e:
    print(f"Error: {e}")
