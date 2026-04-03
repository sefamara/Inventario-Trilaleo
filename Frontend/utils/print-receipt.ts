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
          @page { margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            padding: 10px;
            margin: 0;
            width: 300px; /* Thermal paper standard width */
            font-size: 14px;
            color: #000;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .header { margin-bottom: 10px; }
          .divider { border-bottom: 1px dashed #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 2px 0; vertical-align: top; }
          th { border-bottom: 1px solid #000; }
          .totals { margin-top: 10px; width: 100%; }
        </style>
      </head>
      <body>
        <div class="header text-center">
          <div class="bold" style="font-size: 16px;">TRILALEO</div>
          <div>Ticket de Venta</div>
          <div>--------------------------------</div>
          <div>Fecha: ${new Date(data.date).toLocaleString()}</div>
          <div>Venta: ${data.saleNumber}</div>
          <div class="divider"></div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 15%">Cant</th>
              <th style="width: 55%">Descripción</th>
              <th class="text-right" style="width: 30%">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.cart.map(item => `
              <tr>
                <td>${item.quantity}</td>
                <td>${item.productName}</td>
                <td class="text-right">$${Number(item.subtotal).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <table class="totals">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">$${data.subtotal.toFixed(2)}</td>
          </tr>
          ${data.discount > 0 ? `
          <tr>
            <td>Descuento:</td>
            <td class="text-right">-$${data.discount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr>
            <td class="bold">TOTAL:</td>
            <td class="text-right bold">$${data.total.toFixed(2)}</td>
          </tr>
        </table>
        
        <div class="text-center" style="margin-top: 20px;">
          <div>¡Gracias por su compra!</div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

