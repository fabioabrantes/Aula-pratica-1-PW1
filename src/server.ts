import express, {Request, Response,NextFunction} from 'express';
import { v4 as uuidv4 } from 'uuid';

import {getBalance} from './utils/extractor';

export type Transaction = {
  type:"credit" | "debit";
  date: Date;
  amount: number;
}
export type Client = {
  cpf:string;
  name:string;
  id:string;
  statements: Transaction[];
}

export const clients = [] as Client[];

const app = express();

app.use(express.json());

// middleware
function verifyIfExistsAccountCPF(
  req:Request, 
  resp:Response, 
  next:NextFunction,
  ){
    const { cpf } = req.headers;
    const customerTemp = clients.find((client) => client.cpf === cpf);
    if (!customerTemp) {
      return resp.status(400).json({ error: "Customer not found" });
    }
    req.client = customerTemp;
    
    return next();
  
}

/*** rotas relcionada a entidade cliente */
app.post('/clientsAccount',(request,response)=>{
  const {cpf,name} = request.body;
  // validation dos campus. This
  const ClientExists = clients.some((client)=>client.cpf === cpf);

  if(ClientExists){
    return response.status(400).json({message:'Error: client exists'})
  }

  const ClientNew = {
    cpf,
    name,
    id:uuidv4(),
    statements: []
  }

  clients.push(ClientNew);
  return response.status(201).json({message:"client cadastrado"})

});

app.delete('/clientsAccount', (req, res)=>{
  const {cpf} = req.headers;

  const ClientExists = clients.findIndex((client)=>client.cpf === cpf);
  if(ClientExists === -1){
    return res.status(400).json({message:"cliente não existe"})
  }

  clients.splice(ClientExists,1);

  return res.status(200).json({message:"cliente removido"})

});

app.get('/account/alls', (req, res) => {
  return res.status(200).json(clients);
});

/*** rotas relacionada a entidade transactions */

app.post('/transactions',verifyIfExistsAccountCPF, (request,response)=>{
  const {client} = request;
  const {amount,type} = request.body;
 
  const transaction: Transaction = {
    type,
    date: new Date(),
    amount
  }
  client.statements.push(transaction);

  return response.status(201).json({message:"deposito realizado com sucesso"});

});

app.get('/transactions',verifyIfExistsAccountCPF, (request,response) => {
  const {client} = request;
  return response.status(200).json(client.statements);

});

app.get('/balance',verifyIfExistsAccountCPF, (request,response) => {
  const {client} = request;
  const balance = getBalance(client.statements);
  return response.status(200).json({extrato:balance});

});



app.listen(3334, ()=>{console.log("server online on port 3334");});