// utils/clientReportUtils.ts
"use client";

export const exportToCSV = (data: any[], filename: string) => {
  // Same implementation as before
  const csvContent = [
    Object.keys(data[0]).join(','),
    ...data.map(row => 
      Object.values(row)
        .map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        )
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// utils/clientReportUtils.ts
export const printTable = (tableId: string, title: string) => {
    const table = document.getElementById(tableId);
    if (!table) return;
  // Clone the table to avoid modifying the original
  const tableClone = table.cloneNode(true) as HTMLElement;

  const searchRow = tableClone.querySelector('#search-row');
    if (searchRow) searchRow.style.display = 'none';

    const headerRow = tableClone.querySelector('#header-row');
    if (headerRow) headerRow.lastChild?.remove(); //remove Action header

    const actionFields = tableClone.getElementsByClassName('action');
    for (let i = 0; i < actionFields.length; i++) {
      actionFields[i].style.display = 'none';
    }

  

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    // Fix image sizes before printing
    const images = tableClone.querySelectorAll('img');
    images.forEach(img => {
      img.style.maxWidth = '50px';
      img.style.maxHeight = '50px';
      img.style.width = 'auto';
      img.style.height = 'auto';
    });
  
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
            }
            h1 { 
              color: #333; 
              margin-bottom: 20px;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-top: 20px; 
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            img {
              max-width: 50px !important;
              max-height: 50px !important;
              width: auto !important;
              height: auto !important;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 10px; 
              }
              .no-print { 
                display: none; 
              }
              table {
                width: 100% !important;
              }
              img {
                max-width: 40px !important;
                max-height: 40px !important;
              }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${tableClone.outerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  //==========================EMPLOYEE TABLE=====================

export const printTableEmployee = (tableId: string, title: string) => {
  const table = document.getElementById(tableId);
  if (!table) return;
  // Clone the table to avoid modifying the original
  const tableClone = table.cloneNode(true) as HTMLElement;

  const searchRow = tableClone.querySelector('#search-row');
    if (searchRow) searchRow.style.display = 'none';

    const headerRow = tableClone.querySelector('#header-row');
    if (headerRow) headerRow.lastChild?.remove(); //remove Action header

    const actionFields = tableClone.getElementsByClassName('action');
    for (let i = 0; i < actionFields.length; i++) {
      actionFields[i].style.display = 'none';
    }

  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) return;

  
  // Fix image sizes before printing
  const images = tableClone.querySelectorAll('img');
  images.forEach(img => {
    img.style.maxWidth = '40px';
    img.style.maxHeight = '40px';
    img.style.width = 'auto';
    img.style.height = 'auto';
  });

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
          }
          h1 { 
            color: #333; 
            margin-bottom: 20px;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 20px; 
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold;
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          img {
            max-width: 40px !important;
            max-height: 40px !important;
            width: auto !important;
            height: auto !important;
          }
          @media print {
            body { 
              margin: 0; 
              padding: 10px; 
            }
            .no-print { 
              display: none; 
            }
            table {
              width: 100% !important;
            }
            img {
              max-width: 30px !important;
              max-height: 30px !important;
            }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${tableClone.outerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
//=========================DEPARTMENT EMPLOYEES TABLE============================
export const printTableDepartmentEmployees = (tableId: string, title: string) => {
  const table = document.getElementById(tableId);
  if (!table) return;

// Clone the table to avoid modifying the original
const tableClone = table.cloneNode(true) as HTMLElement;

const searchRow = tableClone.querySelector('#search-row');
  if (searchRow) searchRow.style.display = 'none';

  const headerRow = tableClone.querySelector('#header-row');
  if (headerRow) headerRow.lastChild?.remove(); //remove Action header

  const actionFields = tableClone.getElementsByClassName('action');
  for (let i = 0; i < actionFields.length; i++) {
    actionFields[i].style.display = 'none';
  }

  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) return;
  
  // Fix image sizes before printing
  const images = tableClone.querySelectorAll('img');
  images.forEach(img => {
    img.style.maxWidth = '40px';
    img.style.maxHeight = '40px';
    img.style.width = 'auto';
    img.style.height = 'auto';
  });

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
          }
          h1 { 
            color: #333; 
            margin-bottom: 20px;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 20px; 
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold;
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          img {
            max-width: 40px !important;
            max-height: 40px !important;
            width: auto !important;
            height: auto !important;
          }
          @media print {
            body { 
              margin: 0; 
              padding: 10px; 
            }
            .no-print { 
              display: none; 
            }
            table {
              width: 100% !important;
            }
            img {
              max-width: 30px !important;
              max-height: 30px !important;
            }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${tableClone.outerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};