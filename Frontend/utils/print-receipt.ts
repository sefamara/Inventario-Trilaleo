export const printThermalReceipt = (data: {
  saleNumber: string;
  cart: any[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
}) => {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket de Venta</title>
        <style>
          @page {
            margin: 0;
            /* Sin ancho fijo: se hereda el tamaño de página que ya tiene
               configurado el driver de la impresora térmica (58mm, 80mm, etc.),
               que siempre coincide con el papel físico realmente instalado.
               Forzar aquí un ancho fijo es lo que obligaba al driver a
               reescalar toda la boleta cuando el papel real era más angosto,
               produciendo el texto borroso. */
            size: auto;
          }
          * {
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            padding: 3mm 4mm;
            font-size: 13px;
            font-weight: bold;
            color: #000;
            line-height: 1.35;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .header { margin-bottom: 6px; }
          .divider {
            border: none;
            border-bottom: 1px dashed #000;
            margin: 4px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          th, td {
            text-align: left;
            padding: 2px 0;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          th {
            border-bottom: 1px solid #000;
            font-size: 12px;
          }
          .col-qty { width: 12%; }
          .col-desc { width: 53%; }
          .col-price { width: 35%; text-align: right; }
          .totals { margin-top: 6px; width: 100%; }
          .totals td { padding: 2px 0; }
          .store-name { font-size: 20px; font-weight: bold; letter-spacing: 1px; }
          .cut-line {
            margin-top: 16px;
            border-bottom: 1px dashed #000;
          }
          @media screen {
            body {
              max-width: 320px;
              margin: 0 auto;
            }
          }
          @media print {
            html, body {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="header text-center">
          <div class="store-name">TRILALEO</div>
          <div>Ticket de Venta</div>
          <div class="divider"></div>
          <div style="font-size: 12px;">Fecha: ${new Date(data.date).toLocaleString('es-CL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}</div>
          <div style="font-size: 12px;">Venta: ${data.saleNumber}</div>
          <div class="divider"></div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th class="col-qty">Cant</th>
              <th class="col-desc">Descripción</th>
              <th class="col-price text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.cart.map(item => `
              <tr>
                <td class="col-qty">${item.quantity}</td>
                <td class="col-desc">${item.productName}</td>
                <td class="col-price text-right">$${Number(item.subtotal).toLocaleString('es-CL')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <table class="totals">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">$${data.subtotal.toLocaleString('es-CL')}</td>
          </tr>
          ${data.discount > 0 ? `
          <tr>
            <td>Descuento:</td>
            <td class="text-right">-$${data.discount.toLocaleString('es-CL')}</td>
          </tr>
          ` : ''}
          <tr>
            <td class="bold" style="font-size: 16px; padding-top: 4px;">TOTAL:</td>
            <td class="text-right bold" style="font-size: 16px; padding-top: 4px;">$${data.total.toLocaleString('es-CL')}</td>
          </tr>
        </table>
        
        <div class="text-center" style="margin-top: 12px;">
          <div>¡Gracias por su compra!</div>
        </div>
        
        <div class="cut-line"></div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
