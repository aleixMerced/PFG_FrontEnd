export interface ProducteComanda{
  idProducte: number;
  nomProducte: string;
  unitats: number;
  preuUnitari: number;
  total: number;
  pagat: boolean;
  preuPagat: number;

  stockDisponible?: number;
}

export interface Producte{
  idProducte: number;
  nomProducte: string;
  imatgeProducte: string;
  preuVenta: number;
  nomTipus: string;
  estoc: number;
  minimEstoc: number;
  quantitat: number;
  preuMoment: number;
  preuCompra: number;
}

export interface Comanda {
  idComanda: number;
  nomClient: string;
  estatComanda: 'PENDENT' | 'PAGADA' | 'CONVIDAT';
  tipusPagament?: string | null;
  dataComanda?: string | null;
  dataPagament?: string | null;
  preuComanda: number;
  idTaula: number;
  Productes?: ProducteComanda[];
  nomTaula?: string
}

export interface TipusProducte {
  idTipus: number;
  nomTipus: string;
  fotoTipus: string;
}

export interface LiniaComanda {
  idComanda: number;
  idProducte: number;
  preuMoment: number;
  quantitat: number;
}

export interface Taula {
  idTaula: number;
  ocupat: number;
  interiorexterior: string;
  taulaPare: number | null;
  imatge: string;
  actiu: number;
  numTaula: number;
  subTaules?: Taula[];
  teSubTaules?: number;
  nomMostrat?: string;
}

export interface ResumCaixa {
  totalEfectiu: number;
  totalTargeta: number;
  totalDia: number;
  observacions: string;
}

export interface NouEstoc {
  newStock: number;
  warning?: boolean;
  message?: string;
}

export interface Estadistiques {
  total: number;
  productesTotals: number;
  menusFets: number;
  producteMesVenutId: number | null;
  nomMesVenut: string | null;
  unitatsMesVenut: number | null;
}

