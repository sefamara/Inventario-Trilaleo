import re
import unicodedata

from django.db import migrations


def _quitar_acentos(texto):
    nfkd = unicodedata.normalize('NFKD', texto)
    return ''.join(c for c in nfkd if not unicodedata.combining(c))


def _derivar_prefijo(nombre, prefijos_usados):
    limpio = _quitar_acentos(nombre or '').upper()
    letras = re.sub(r'[^A-Z]', '', limpio)
    base = letras[:3] or 'CAT'

    candidato = base
    sufijo = 1
    while candidato in prefijos_usados:
        sufijo += 1
        candidato = f"{base}{sufijo}"

    prefijos_usados.add(candidato)
    return candidato


def fijar_prefijos_y_renumerar_skus(apps, schema_editor):
    """
    Asigna un prefijo único por categoría (si no lo tiene) y renumera
    los SKU de todos sus productos como "{PREFIJO}-0001", "{PREFIJO}-0002", ...
    Esto elimina cualquier SKU duplicado o vacío heredado de la generación
    anterior (client-side, sin control de concurrencia) y deja la base lista
    para que el backend genere SKU nuevos de forma atómica por categoría.
    """
    Categoria = apps.get_model('gestion', 'Categoria')
    Producto = apps.get_model('gestion', 'Producto')

    prefijos_usados = set(
        Categoria.objects.exclude(sku_prefix='').values_list('sku_prefix', flat=True)
    )

    for categoria in Categoria.objects.all().order_by('id_categoria'):
        if not categoria.sku_prefix:
            categoria.sku_prefix = _derivar_prefijo(categoria.nombre, prefijos_usados)
            categoria.save(update_fields=['sku_prefix'])
        else:
            prefijos_usados.add(categoria.sku_prefix)

        productos = Producto.objects.filter(id_categoria=categoria).order_by('id_producto')
        contador = 0
        for producto in productos:
            contador += 1
            nuevo_sku = f"{categoria.sku_prefix}-{contador:04d}"
            if producto.sku != nuevo_sku:
                producto.sku = nuevo_sku
                producto.save(update_fields=['sku'])

        categoria.ultimo_sku_numero = contador
        categoria.save(update_fields=['ultimo_sku_numero'])


def revertir(apps, schema_editor):
    # No se revierte: los SKU originales (duplicados) no se pueden ni se deben restaurar.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('gestion', '0003_categoria_sku_fields'),
    ]

    operations = [
        migrations.RunPython(fijar_prefijos_y_renumerar_skus, revertir),
    ]
