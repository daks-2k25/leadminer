import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { listarLeads } from "@/src/storage/leads";

const COLUNAS = [
  { header: "Empresa", key: "nome" },
  { header: "Telefone", key: "telefone" },
  { header: "Website", key: "website" },
  { header: "Endereço", key: "endereco" },
  { header: "Cidade", key: "cidade" },
  { header: "Categoria", key: "categoria" },
  { header: "Link Maps", key: "urlMaps" },
  { header: "Capturado em", key: "capturadoEm" },
] as const;

const HEADER_ROW = 4;

function formatarDataHora(data: Date) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

function celulaTexto(valor: unknown): string {
  if (valor instanceof Date) return formatarDataHora(valor);
  return valor ? String(valor) : "";
}

export async function GET() {
  const leads = listarLeads();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads");

  const totalColunas = COLUNAS.length;

  sheet.mergeCells(1, 1, 1, totalColunas);
  const tituloCell = sheet.getCell(1, 1);
  tituloCell.value = "LeadMiner - Lista de Leads";
  tituloCell.font = { bold: true, size: 14 };

  sheet.mergeCells(2, 1, 2, totalColunas);
  const dataCell = sheet.getCell(2, 1);
  dataCell.value = `Gerado em: ${formatarDataHora(new Date())}`;
  dataCell.font = { italic: true };

  const headerRow = sheet.getRow(HEADER_ROW);
  COLUNAS.forEach((coluna, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = coluna.header;
    cell.font = { bold: true };
  });

  for (const lead of leads) {
    const registro = lead as unknown as Record<string, unknown>;

    const valores = COLUNAS.map((coluna) => {
      if (coluna.key === "capturadoEm") {
        const bruto = registro.capturadoEm;
        return typeof bruto === "string" ? new Date(bruto) : bruto;
      }
      return registro[coluna.key];
    });

    const row = sheet.addRow(valores);

    const capturadoEmCell = row.getCell(totalColunas);
    capturadoEmCell.numFmt = "dd/mm/yyyy hh:mm";
  }

  COLUNAS.forEach((coluna, index) => {
    const columnIndex = index + 1;
    let maiorTamanho = coluna.header.length;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= HEADER_ROW) return;
      const tamanho = celulaTexto(row.getCell(columnIndex).value).length;
      maiorTamanho = Math.max(maiorTamanho, tamanho);
    });

    sheet.getColumn(columnIndex).width = Math.min(
      Math.max(maiorTamanho + 2, 12),
      60
    );
  });

  sheet.autoFilter = {
    from: { row: HEADER_ROW, column: 1 },
    to: { row: HEADER_ROW, column: totalColunas },
  };

  sheet.views = [{ state: "frozen", ySplit: HEADER_ROW }];

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=leads.xlsx",
    },
  });
}
