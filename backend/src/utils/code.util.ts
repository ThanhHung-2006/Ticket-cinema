import QRCode from 'qrcode';

export class CodeUtil {
  public static generateBookingCode(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${dateStr}-${rand}`;
  }

  public static generateTicketCode(row: string, seatNum: number): string {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${row}${seatNum}-${rand}`;
  }

  public static async generateQrCodeBase64(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 250,
      });
    } catch {
      return '';
    }
  }
}
