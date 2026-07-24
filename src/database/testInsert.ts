import { inserirLead } from "../storage/leads";

inserirLead({
  nome: "Teste",
  telefone: "(41) 99999-9999",
  website: "teste.com",
  endereco: "Rua Teste, 123",
  cidade: "Curitiba",
  categoria: "Clínicas",
  urlMaps: "https://maps.google.com/teste-123",
  capturadoEm: new Date().toISOString(),
});

console.log("Lead inserido com sucesso");
