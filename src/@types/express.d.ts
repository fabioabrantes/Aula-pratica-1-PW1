type Transaction = {
  type:"credit" | "debit";
  date: Date;
  amount: number;
}
type Client = {
  cpf:string;
  name:string;
  id:string;
  statements: Transaction[];
}
declare namespace Express{
  export interface Request{
    client:Client;
  }
}