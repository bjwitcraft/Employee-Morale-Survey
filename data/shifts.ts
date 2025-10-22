export type ShiftCode = '10A' | '10B' | '12A' | '12B';
export interface ShiftDef {
  code: ShiftCode;
  days: ('Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun')[];
  start: string; // 24h format
  end: string;   // 24h format
}

export const SHIFTS: Record<ShiftCode, ShiftDef> = {
  '10A': { code: '10A', days: ['Tue','Wed','Thu','Fri'], start: '07:00', end: '19:00' },
  '10B': { code: '10B', days: ['Tue','Wed','Thu','Fri'], start: '17:30', end: '03:30' },
  '12A': { code: '12A', days: ['Sat','Sun','Mon'], start: '07:00', end: '19:00' },
  '12B': { code: '12B', days: ['Sat','Sun','Mon'], start: '19:00', end: '07:00' } // ends Tue morning
};
