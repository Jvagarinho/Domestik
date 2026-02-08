import { format } from 'date-fns';
import type { Service, Client } from '../types';

interface ExportFilters {
    filterClient?: string;
    startDate?: string;
    endDate?: string;
    minValue?: string;
    maxValue?: string;
    getClientName?: (id: string) => string;
}

export function exportToExcel(services: Service[], clients: Client[], language: 'en' | 'pt', selectedDate: Date): void {
    const currencySymbol = language === 'pt' ? '€' : '$';
    const monthName = format(selectedDate, language === 'pt' ? 'MMMM yyyy' : 'MMMM yyyy');

    const rows = [
        [language === 'pt' ? 'Data' : 'Date', language === 'pt' ? 'Cliente' : 'Client', language === 'pt' ? 'Horas' : 'Hours', language === 'pt' ? 'Taxa/Hora' : 'Rate/Hr', language === 'pt' ? 'Total' : 'Total']
    ];

    services.forEach(service => {
        const client = clients.find(c => c.id === service.client_id);
        const clientName = client?.name ?? (language === 'pt' ? 'Desconhecido' : 'Unknown');
        rows.push([
            service.date,
            clientName,
            service.time_worked.toString(),
            service.hourly_rate.toString(),
            `${currencySymbol}${service.total.toFixed(2)}`
        ]);
    });

    const total = services.reduce((sum, s) => sum + s.total, 0);
    rows.push(['', '', '', language === 'pt' ? 'TOTAL' : 'TOTAL', `${currencySymbol}${total.toFixed(2)}`]);

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Domestik_${monthName}_Report.csv`;
    link.click();
}

export function exportToPDF(services: Service[], clients: Client[], language: 'en' | 'pt', selectedDate: Date, filters?: ExportFilters): void {
    const currencySymbol = language === 'pt' ? '€' : '$';
    const monthName = format(selectedDate, language === 'pt' ? 'MMMM yyyy' : 'MMMM yyyy');

    // Prepare filter info for header
    const filterInfo = [];
    if (filters?.filterClient && filters.getClientName) {
        filterInfo.push(`${language === 'pt' ? 'Cliente' : 'Client'}: ${filters.getClientName(filters.filterClient)}`);
    }
    if (filters?.startDate) {
        filterInfo.push(`${language === 'pt' ? 'De' : 'From'}: ${filters.startDate}`);
    }
    if (filters?.endDate) {
        filterInfo.push(`${language === 'pt' ? 'Até' : 'To'}: ${filters.endDate}`);
    }
    if (filters?.minValue) {
        filterInfo.push(`${language === 'pt' ? 'Valor Mín.' : 'Min Value'}: ${currencySymbol}${filters.minValue}`);
    }
    if (filters?.maxValue) {
        filterInfo.push(`${language === 'pt' ? 'Valor Máx.' : 'Max Value'}: ${currencySymbol}${filters.maxValue}`);
    }

    let html = `
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                h1 { color: #2F4F4F; border-bottom: 3px solid #2F4F4F; padding-bottom: 10px; }
                h2 { color: #555; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #2F4F4F; color: white; padding: 12px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background: #f9f9f9; }
                .total-row { background: #E8F4F8 !important; font-weight: bold; }
                .summary { margin-top: 30px; padding: 20px; background: #F8F9FA; border-radius: 8px; }
                .summary-item { display: flex; justify-content: space-between; padding: 8px 0; }
                .filter-info { margin-bottom: 20px; padding: 15px; background: #F0F9FF; border-radius: 8px; border-left: 4px solid #3B82F6; }
                .filter-info h3 { margin-top: 0; color: #1E40AF; }
                .filter-info ul { margin: 10px 0; padding-left: 20px; }
                .filter-info li { margin: 5px 0; }
            </style>
        </head>
        <body>
            <h1>${language === 'pt' ? 'Relatório Mensal' : 'Monthly Report'} - ${monthName}</h1>
            
            ${filterInfo.length > 0 ? `
            <div class="filter-info">
                <h3>${language === 'pt' ? 'Filtros Aplicados' : 'Applied Filters'}</h3>
                <ul>
                    ${filterInfo.map(info => `<li>${info}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            <h2>${language === 'pt' ? 'Resumo' : 'Summary'}</h2>
            <div class="summary">
                <div class="summary-item">
                    <span>${language === 'pt' ? 'Serviços' : 'Services'}:</span>
                    <span>${services.length}</span>
                </div>
                <div class="summary-item">
                    <span>${language === 'pt' ? 'Horas Totais' : 'Total Hours'}:</span>
                    <span>${services.reduce((sum, s) => sum + s.time_worked, 0).toFixed(1)}h</span>
                </div>
                <div class="summary-item">
                    <span>${language === 'pt' ? 'Total Geral' : 'Grand Total'}:</span>
                    <span>${currencySymbol}${services.reduce((sum, s) => sum + s.total, 0).toFixed(2)}</span>
                </div>
            </div>

            <h2>${language === 'pt' ? 'Detalhes dos Serviços' : 'Service Details'}</h2>
            <table>
                <thead>
                    <tr>
                        <th>${language === 'pt' ? 'Data' : 'Date'}</th>
                        <th>${language === 'pt' ? 'Cliente' : 'Client'}</th>
                        <th>${language === 'pt' ? 'Horas' : 'Hours'}</th>
                        <th>${language === 'pt' ? 'Taxa/Hora' : 'Rate/Hr'}</th>
                        <th>${language === 'pt' ? 'Total' : 'Total'}</th>
                    </tr>
                </thead>
                <tbody>
    `;

    services.forEach(service => {
        const client = clients.find(c => c.id === service.client_id);
        html += `
            <tr>
                <td>${service.date}</td>
                <td>${client?.name ?? (language === 'pt' ? 'Desconhecido' : 'Unknown')}</td>
                <td>${service.time_worked}</td>
                <td>${currencySymbol}${service.hourly_rate.toFixed(2)}</td>
                <td>${currencySymbol}${service.total.toFixed(2)}</td>
            </tr>
        `;
    });

    const total = services.reduce((sum, s) => sum + s.total, 0);
    html += `
                <tr class="total-row">
                    <td colspan="4">${language === 'pt' ? 'TOTAL GERAL' : 'GRAND TOTAL'}</td>
                    <td>${currencySymbol}${total.toFixed(2)}</td>
                </tr>
                </tbody>
            </table>
            
            <p style="margin-top: 40px; color: #999; font-size: 12px; text-align: center;">
                ${language === 'pt' ? 'Gerado por Domestik' : 'Generated by Domestik'} - ${format(new Date(), 'yyyy-MM-dd HH:mm')}
            </p>
        </body>
        </html>
    `;

    // Convert HTML to PDF and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Domestik_${monthName}_Report.html`;
    link.click();
    
    // Clean up
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

export function exportClientReportToExcel(_clientId: string, client: Client, services: Service[], language: 'en' | 'pt'): void {
    const currencySymbol = language === 'pt' ? '€' : '$';
    const rows = [
        [language === 'pt' ? 'Relatório de Cliente' : 'Client Report'],
        [`${language === 'pt' ? 'Cliente' : 'Client'}: ${client.name}`],
        [''],
        [language === 'pt' ? 'Data' : 'Date', language === 'pt' ? 'Horas' : 'Hours', language === 'pt' ? 'Taxa/Hora' : 'Rate/Hr', language === 'pt' ? 'Total' : 'Total']
    ];

    services.forEach(service => {
        rows.push([
            service.date,
            service.time_worked.toString(),
            service.hourly_rate.toString(),
            `${currencySymbol}${service.total.toFixed(2)}`
        ]);
    });

    const total = services.reduce((sum, s) => sum + s.total, 0);
    const totalHours = services.reduce((sum, s) => sum + s.time_worked, 0);
    
    rows.push(['', language === 'pt' ? 'TOTAL' : 'TOTAL', '', `${currencySymbol}${total.toFixed(2)}`]);
    rows.push([language === 'pt' ? 'Resumo:' : 'Summary:', '', '', '']);
    rows.push([language === 'pt' ? 'Serviços' : 'Services', services.length.toString(), '', '']);
    rows.push([language === 'pt' ? 'Horas Totais' : 'Total Hours', totalHours.toFixed(1) + 'h', '', '']);
    rows.push([language === 'pt' ? 'Valor Total' : 'Total Value', '', '', `${currencySymbol}${total.toFixed(2)}`]);

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Domestik_${client.name.replace(/\s+/g, '_')}_Report.csv`;
    link.click();
}

export function exportClientReportToPDF(_clientId: string, client: Client, services: Service[], language: 'en' | 'pt'): void {
    const currencySymbol = language === 'pt' ? '€' : '$';

    const total = services.reduce((sum, s) => sum + s.total, 0);
    const totalHours = services.reduce((sum, s) => sum + s.time_worked, 0);

    let html = `
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                h1 { color: #2F4F4F; border-bottom: 3px solid #2F4F4F; padding-bottom: 10px; }
                .client-header { margin-top: 20px; padding: 15px; background: #F8F9FA; border-radius: 8px; border-left: 5px solid ${client.color}; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: ${client.color}; color: white; padding: 12px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background: #f9f9f9; }
                .total-row { background: #E8F4F8 !important; font-weight: bold; }
                .summary { margin-top: 30px; padding: 20px; background: #F8F9FA; border-radius: 8px; }
                .summary-item { display: flex; justify-content: space-between; padding: 8px 0; }
            </style>
        </head>
        <body>
            <h1>${language === 'pt' ? 'Relatório de Cliente' : 'Client Report'}</h1>
            
            <div class="client-header">
                <h2 style="margin: 0; color: ${client.color};">${client.name}</h2>
            </div>

            <div class="summary">
                <div class="summary-item">
                    <span>${language === 'pt' ? 'Total de Serviços' : 'Total Services'}:</span>
                    <span>${services.length}</span>
                </div>
                <div class="summary-item">
                    <span>${language === 'pt' ? 'Total de Horas' : 'Total Hours'}:</span>
                    <span>${totalHours.toFixed(1)}h</span>
                </div>
                <div class="summary-item">
                    <span>${language === 'pt' ? 'Valor Total' : 'Total Value'}:</span>
                    <span><strong>${currencySymbol}${total.toFixed(2)}</strong></span>
                </div>
            </div>

            <h2>${language === 'pt' ? 'Histórico de Serviços' : 'Service History'}</h2>
            <table>
                <thead>
                    <tr>
                        <th>${language === 'pt' ? 'Data' : 'Date'}</th>
                        <th>${language === 'pt' ? 'Horas' : 'Hours'}</th>
                        <th>${language === 'pt' ? 'Taxa/Hora' : 'Rate/Hr'}</th>
                        <th>${language === 'pt' ? 'Total' : 'Total'}</th>
                    </tr>
                </thead>
                <tbody>
    `;

    services.forEach(service => {
        html += `
            <tr>
                <td>${service.date}</td>
                <td>${service.time_worked}</td>
                <td>${currencySymbol}${service.hourly_rate.toFixed(2)}</td>
                <td>${currencySymbol}${service.total.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
                <tr class="total-row">
                    <td colspan="3">${language === 'pt' ? 'TOTAL' : 'TOTAL'}</td>
                    <td>${currencySymbol}${total.toFixed(2)}</td>
                </tr>
                </tbody>
            </table>
            
            <p style="margin-top: 40px; color: #999; font-size: 12px; text-align: center;">
                ${language === 'pt' ? 'Gerado por Domestik' : 'Generated by Domestik'} - ${format(new Date(), 'yyyy-MM-dd HH:mm')}
            </p>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }
}
}
    if (filters?.endDate) {
        filterInfo.push(`${language === 'pt' ? 'Até' : 'To'}: ${filters.endDate}`);
    }
    if (filters?.minValue) {
        filterInfo.push(`${language === 'pt' ? 'Valor Mín.' : 'Min Value'}: ${currencySymbol}${filters.minValue}`);
    }
    if (filters?.maxValue) {
        filterInfo.push(`${language === 'pt' ? 'Valor Máx.' : 'Max Value'}: ${currencySymbol}${filters.maxValue}`);
    }

    let html = `
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                h1 { color: #2F4F4F; border-bottom: 3px solid #2F4F4F; padding-bottom: 10px; }
                .client-header { margin-top: 20px; padding: 15px; background: #F8F9FA; border-radius: 8px; border-left: 5px solid ${client.color}; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: ${client.color}; color: white; padding: 12px; text-align: left; }
                td { padding: 10px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background: #f9f9f9; }
                .total-row { background: #E8F4F8 !important; font-weight: bold; }
                .summary { margin-top: 30px; padding: 20px; background: #F8F9FA; border-radius: 8px; }
                .summary-item { display: flex; justify-content: space-between; padding: 8px 0; }
                .filter-info { margin-bottom: 20px; padding: 15px; background: #F0F9FF; border-radius: 8px; border-left: 4px solid #3B82F6; }
                .filter-info h3 { margin-top: 0; color: #1E40AF; }
                .filter-info ul { margin: 10px 0; padding-left: 20px; }
                .filter-info li { margin: 5px 0; }
            </style>
        </head>
        <body>
            <h1>${language === 'pt' ? 'Relatório de Cliente' : 'Client Report'}</h1>
            
            <div class="client-header">
                <h2 style="margin: 0; color: ${client.color};">${client.name}</h2>
            </div>
            
            ${filterInfo.length > 0 ? `
            <div class="filter-info">
                <h3>${language === 'pt' ? 'Filtros Aplicados' : 'Applied Filters'}</h3>
                <ul>
                    ${filterInfo.map(info => `<li>${info}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <div class="summary">
                <div class="summary-item">
                    <span>${language === 'pt' ? 'Total de Serviços' : 'Total Services'}:</span>
                    <span>${services.length}</span>
                </div>
                <div class="summary-item">
                    <span>${language === 'pt' ? 'Total de Horas' : 'Total Hours'}:</span>
                    <span>${totalHours.toFixed(1)}h</span>
                </div>
                <div class="summary-item">
                    <span>${language === 'pt' ? 'Valor Total' : 'Total Value'}:</span>
                    <span><strong>${currencySymbol}${total.toFixed(2)}</strong></span>
                </div>
            </div>

            <h2>${language === 'pt' ? 'Histórico de Serviços' : 'Service History'}</h2>
            <table>
                <thead>
                    <tr>
                        <th>${language === 'pt' ? 'Data' : 'Date'}</th>
                        <th>${language === 'pt' ? 'Horas' : 'Hours'}</th>
                        <th>${language === 'pt' ? 'Taxa/Hora' : 'Rate/Hr'}</th>
                        <th>${language === 'pt' ? 'Total' : 'Total'}</th>
                    </tr>
                </thead>
                <tbody>
    `;

    services.forEach(service => {
        html += `
            <tr>
                <td>${service.date}</td>
                <td>${service.time_worked}</td>
                <td>${currencySymbol}${service.hourly_rate.toFixed(2)}</td>
                <td>${currencySymbol}${service.total.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
                <tr class="total-row">
                    <td colspan="3">${language === 'pt' ? 'TOTAL' : 'TOTAL'}</td>
                    <td>${currencySymbol}${total.toFixed(2)}</td>
                </tr>
                </tbody>
            </table>
            
            <p style="margin-top: 40px; color: #999; font-size: 12px; text-align: center;">
                ${language === 'pt' ? 'Gerado por Domestik' : 'Generated by Domestik'} - ${format(new Date(), 'yyyy-MM-dd HH:mm')}
            </p>
        </body>
        </html>
    `;

    // Convert HTML to PDF and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Domestik_${client.name.replace(/\s+/g, '_')}_Report.html`;
    link.click();
    
    // Clean up
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}
