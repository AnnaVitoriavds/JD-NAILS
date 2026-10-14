JD NAILS — SITE COMPLETO + AGENDA VISUAL + ADMIN
==================================================

COMO ABRIR NO VS CODE
1. Extraia o ZIP.
2. Abra a pasta JD-NAILS-COMPLETO-BONITO no VS Code.
3. Abra o Terminal.
4. Rode: npm start
5. Site:  http://localhost:3000
6. Admin: http://localhost:3000/admin.html

O QUE FOI AJUSTADO NESTA VERSÃO
- O campo nativo gigante de horários foi removido.
- Datas agora aparecem em cartões bonitos e responsivos.
- Datas livres aparecem como "Livre".
- Datas que já possuem agendamento aparecem com cadeado e ficam desabilitadas.
- Uma data com qualquer agendamento ativo fica BLOQUEADA POR INTEIRO no site.
- Se o agendamento for cancelado/excluído no Admin, a data volta a ficar livre automaticamente.
- Folgas, feriados e dias fechados não são oferecidos para agendamento.
- Horários aparecem como botões depois que a cliente escolhe uma data livre.
- O sistema revalida a data antes de salvar para evitar reserva duplicada.
- O WhatsApp continua abrindo com a mensagem pronta.
- As fotos locais do portfólio foram renomeadas para nomes seguros (sem acentos quebrados), corrigindo cards que ficavam vazios.
- Fotos enviadas pelo painel Admin também são lidas do bucket site-images do Supabase quando disponível.

HORÁRIOS PADRÃO
- Segunda a sexta: 09:00 às 20:00
- Sábado: 09:00 às 15:00
- Domingo: fechado
- Feriados: fechado

IMPORTANTE — BLOQUEIO NO BANCO
Para garantir que duas pessoas nunca consigam reservar a mesma data ao mesmo tempo, execute UMA VEZ no SQL Editor do Supabase o arquivo:
SUPABASE-AGENDA-UMA-DATA.sql

Esse SQL:
1. cria a função pública que informa apenas quais datas estão ocupadas;
2. cria um índice único que permite somente um agendamento ativo por data.

Se já existirem dois agendamentos ativos na mesma data, cancele/exclua a duplicata antes de criar o índice.

FOTOS
As imagens fixas ficam na pasta assets.
Os arquivos usados no portfólio têm nomes simples, por exemplo:
- elegancia-minimalista.jpeg
- pezinho-de-luxo.jpg
- detalhe-premium.jpeg
- mao-luxuosa.jpg
- pe.jpg

O painel Admin usa o bucket público "site-images" do Supabase para imagens enviadas por upload.

TESTE RÁPIDO
No terminal você também pode rodar:
npm run check

Esse comando verifica a sintaxe de server.js, script.js e admin.js.
