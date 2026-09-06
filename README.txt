JD NAILS — PROJETO COMPLETO PRONTO PARA VS CODE
================================================

O projeto já contém FRONTEND + BACKEND. Não precisa criar server.js e não precisa instalar bibliotecas npm.

REQUISITO
---------
Node.js 18 ou superior. Você já pode conferir no terminal com:
node -v

COMO ABRIR NO VS CODE
---------------------
1. Extraia a pasta inteira.
2. Abra o VS Code.
3. Arquivo > Abrir Pasta.
4. Selecione a pasta "JD-NAILS-COMPLETO-PRONTO".

Também existe o arquivo ABRIR-NO-VSCODE.bat para tentar abrir a pasta automaticamente.

COMO INICIAR
------------
No terminal integrado do VS Code:

npm start

Não é necessário npm install porque o backend usa somente módulos nativos do Node.js.

Depois abra:
Site:  http://localhost:3000
Admin: http://localhost:3000/admin.html

LOGIN ADMIN
-----------
Usuário: jdnails
Senha: jd2026

AGENDAMENTO
-----------
- Segunda a sexta: 09:00 às 20:00
- Sábado: 09:00 às 15:00
- Domingo: fechado
- Feriados nacionais: fechados
- Datas extras podem ser bloqueadas no painel.
- A cliente vê apenas dias de atendimento.
- Após escolher o dia, vê apenas horários livres em intervalos de 30 minutos.
- Horários já solicitados não aparecem para outra cliente.
- Ao enviar, o pedido é salvo e o WhatsApp é aberto com a mensagem pronta.

PAINEL ADMINISTRATIVO
---------------------
O painel permite:
- visualizar pedidos/agendamentos;
- filtrar por pendente, confirmado, concluído e cancelado;
- abrir confirmação diretamente no WhatsApp da cliente;
- confirmar, concluir, cancelar ou excluir um pedido;
- alterar os horários de cada dia;
- bloquear feriados, folgas e datas sem atendimento;
- trocar a foto principal;
- trocar a foto da seção Sobre;
- adicionar/remover fotos do portfólio.

ARQUIVOS IMPORTANTES
--------------------
index.html       -> site principal
styles.css       -> visual do site
script.js        -> interações e agendamento
admin.html       -> painel administrativo
admin.css        -> visual do painel
admin.js         -> funcionalidades do painel
server.js        -> backend/API
package.json     -> comando npm start
data/store.json  -> horários, fotos e agendamentos
uploads/         -> imagens enviadas pelo painel
assets/          -> imagens iniciais do site

SE A PORTA 3000 ESTIVER OCUPADA
-------------------------------
No Windows:

taskkill /F /IM node.exe
npm start

Atenção: o primeiro comando encerra todos os processos Node.js abertos no computador.

ATALHO DO VS CODE
-----------------
Você também pode pressionar Ctrl+Shift+B e escolher/iniciar a tarefa "Iniciar JD Nails".

PUBLICAÇÃO ONLINE
-----------------
Esta versão funciona completa localmente com Node.js. Para produção em hospedagens serverless como Vercel, o armazenamento em data/store.json e uploads/ deve ser migrado para um banco/storage persistente, como Supabase. Não publique credenciais administrativas reais em repositório público.
